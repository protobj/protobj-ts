import { types } from "./extension";
import { LinkedBuffer } from "./LinkedBuffer";
import { WriteSession } from "./WriteSession";
import i32 = types.i32;
import toCodePoint = types.toCodePoint;
import isLowSurrogate = types.isLowSurrogate;
import isHighSurrogate = types.isHighSurrogate;

export class StringSerializer {

    static TWO_BYTE_LOWER_LIMIT = 1 << 7;

    static ONE_BYTE_EXCLUSIVE = StringSerializer.TWO_BYTE_LOWER_LIMIT / 3 + 1;

    static THREE_BYTE_LOWER_LIMIT = 1 << 14;

    static TWO_BYTE_EXCLUSIVE = StringSerializer.THREE_BYTE_LOWER_LIMIT / 3 + 1;

    static FOUR_BYTE_LOWER_LIMIT = 1 << 21;

    static THREE_BYTE_EXCLUSIVE = StringSerializer.FOUR_BYTE_LOWER_LIMIT / 3 + 1;

    static FIVE_BYTE_LOWER_LIMIT = 1 << 28;

    static FOUR_BYTE_EXCLUSIVE = StringSerializer.FIVE_BYTE_LOWER_LIMIT / 3 + 1;

    static writeUTF8VarDelimited(str: string, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        const len: i32 = str.length;
        if (len === 0) {
            if (lb.offset == lb.buffer.length) {
                lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
            }
            lb.buffer[lb.offset++] = 0x00;
            session.size++;
            return lb;
        }
        if (len < StringSerializer.ONE_BYTE_EXCLUSIVE) {

            return StringSerializer.writeUTF8OneByteDelimited(str, 0, len, session, lb)
        }
        if (len < StringSerializer.ONE_BYTE_EXCLUSIVE) {
            // the varint will be max 1-byte. (even if all chars are non-ascii)
            return StringSerializer.writeUTF8OneByteDelimited(str, 0, len, session, lb);
        }

        if (len < StringSerializer.TWO_BYTE_EXCLUSIVE) {
            // the varint will be max 2-bytes and could be 1-byte. (even if all non-ascii)
            return StringSerializer.writeUTF8VarDelimited0(str, 0, len, StringSerializer.TWO_BYTE_LOWER_LIMIT, 2,
                session, lb);
        }

        if (len < StringSerializer.THREE_BYTE_EXCLUSIVE) {
            // the varint will be max 3-bytes and could be 2-bytes. (even if all non-ascii)
            return StringSerializer.writeUTF8VarDelimited0(str, 0, len, StringSerializer.THREE_BYTE_LOWER_LIMIT, 3,
                session, lb);
        }

        if (len < StringSerializer.FOUR_BYTE_EXCLUSIVE) {
            // the varint will be max 4-bytes and could be 3-bytes. (even if all non-ascii)
            return StringSerializer.writeUTF8VarDelimited0(str, 0, len, StringSerializer.FOUR_BYTE_LOWER_LIMIT, 4,
                session, lb);
        }

        // the varint will be max 5-bytes and could be 4-bytes. (even if all non-ascii)
        return StringSerializer.writeUTF8VarDelimited0(str, 0, len, StringSerializer.FIVE_BYTE_LOWER_LIMIT, 5, session, lb);
    }

    private static writeUTF8OneByteDelimited(str: string, index: number, len: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        const lastSize: i32 = session.size;

        if (lb.offset == lb.buffer.length) {
            // create a new buffer.
            let size = len + 1 > session.nextBufferSize ? len + 1 : session.nextBufferSize;
            lb = new LinkedBuffer(new Uint8Array(size), 0, 0, lb);

            lb.offset = 1;

            // fast path
            const rb: LinkedBuffer = StringSerializer.writeUTF8_5(str, index, len, session, lb);

            lb.buffer[0] = (session.size - lastSize);

            // update size
            session.size++;

            return rb;
        }

        const withIntOffset: i32 = lb.offset + 1;
        if (withIntOffset + len > lb.buffer.length) {
            // not enough space for the string.
            lb.offset = withIntOffset;

            const buffer = lb.buffer;

            // slow path
            const rb: LinkedBuffer = StringSerializer.writeUTF8_8(str, index, len, buffer, withIntOffset, buffer.length,
                session, lb);

            buffer[withIntOffset - 1] = (session.size - lastSize);

            // update size
            session.size++;

            return rb;
        }

        // everything fits
        lb.offset = withIntOffset;

        const rb: LinkedBuffer = StringSerializer.writeUTF8_5(str, index, len, session, lb);

        lb.buffer[withIntOffset - 1] = (session.size - lastSize);

        // update size
        session.size++;

        return rb;
    }

    private static writeUTF8_5(str: string, i: i32, len: i32, session: WriteSession, lb: LinkedBuffer) {
        const buffer: Uint8Array | Int8Array = lb.buffer;
        for (let c: i32 = 0, offset = lb.offset, adjustableLimit = offset + len; ; c = 0) {
            while (i != len && (c = str.charCodeAt(i++)) < 0x0080)
                buffer[offset++] = c;

            if (i == len && c < 0x0080) {
                session.size += (offset - lb.offset);
                lb.offset = offset;
                return lb;
            }

            if (c < 0x0800) {
                if (++adjustableLimit > buffer.length) {
                    session.size += (offset - lb.offset);
                    lb.offset = offset;
                    return StringSerializer.writeUTF8_8(str, i - 1, len, buffer, offset, buffer.length, session, lb);
                }

                buffer[offset++] = (0xC0 | ((c >> 6) & 0x1F));
                buffer[offset++] = (0x80 | ((c >> 0) & 0x3F));
            } else if (isHighSurrogate(c) && i < len && isLowSurrogate(str.charCodeAt(i))) {
                // We have a surrogate pair, so use the 4-byte encoding.
                adjustableLimit += 3;
                if (adjustableLimit > buffer.length) {
                    session.size += (offset - lb.offset);
                    lb.offset = offset;
                    return StringSerializer.writeUTF8_8(str, i - 1, len, buffer, offset, buffer.length, session, lb);
                }

                let codePoint: number = toCodePoint(c, str.charCodeAt(i));
                buffer[offset++] = (0xF0 | ((codePoint >> 18) & 0x07));
                buffer[offset++] = (0x80 | ((codePoint >> 12) & 0x3F));
                buffer[offset++] = (0x80 | ((codePoint >> 6) & 0x3F));
                buffer[offset++] = (0x80 | ((codePoint >> 0) & 0x3F));

                i++;
            } else {
                adjustableLimit += 2;
                if (adjustableLimit > buffer.length) {
                    session.size += (offset - lb.offset);
                    lb.offset = offset;
                    return StringSerializer.writeUTF8_8(str, i - 1, len, buffer, offset, buffer.length, session, lb);
                }

                buffer[offset++] = (0xE0 | ((c >> 12) & 0x0F));
                buffer[offset++] = (0x80 | ((c >> 6) & 0x3F));
                buffer[offset++] = (0x80 | ((c >> 0) & 0x3F));
            }
        }
    }

    private static writeUTF8VarDelimited0(str: string, index: i32, len: i32, lowerLimit: i32,
        expectedSize: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        let lastSize: i32 = session.size, offset: i32 = lb.offset, withIntOffset: i32 = offset + expectedSize;

        if (withIntOffset > lb.buffer.length) {
            // not enough space for the varint.
            // create a new buffer.
            let bufferSize = len + expectedSize > session.nextBufferSize ? len + expectedSize : session.nextBufferSize;
            lb = new LinkedBuffer(new Uint8Array(bufferSize), 0, 0, lb);
            offset = lb.start;
            lb.offset = withIntOffset = offset + expectedSize;

            // fast path
            const rb: LinkedBuffer = StringSerializer.writeUTF8_5(str, index, len, session, lb);

            let size: i32 = session.size - lastSize;

            if (size < lowerLimit) {
                let src: Uint8Array | Int8Array = lb.buffer;
                let srcPos: i32 = withIntOffset;
                let dest: Uint8Array | Int8Array = lb.buffer;
                let destPos: i32 = withIntOffset - 1;
                let length: i32 = lb.offset - withIntOffset;
                // move one space to the left since the varint is 1-byte smaller
                let uint8Array = src.slice(srcPos, srcPos + length);
                dest.set(uint8Array, destPos);
                expectedSize--;
                lb.offset--;
            }

            // update size
            session.size += expectedSize;

            for (; --expectedSize > 0; size >>>= 7)
                lb.buffer[offset++] = ((size & 0x7F) | 0x80);

            lb.buffer[offset] = (size);

            return rb;
        }

        if (withIntOffset + len > lb.buffer.length) {
            // not enough space for the string.
            lb.offset = withIntOffset;

            // slow path
            const rb: LinkedBuffer = StringSerializer.writeUTF8_8(str, index, len,
                lb.buffer, withIntOffset, lb.buffer.length, session, lb);

            let size: i32 = session.size - lastSize;

            if (size < lowerLimit) {
                // move one space to the left since the varint is 1-byte smaller
                let src: Uint8Array | Int8Array = lb.buffer;
                let srcPos: i32 = withIntOffset;
                let dest: Uint8Array | Int8Array = lb.buffer;
                let destPos: i32 = withIntOffset - 1;
                let length: i32 = lb.offset - withIntOffset;
                let uint8Array = src.slice(srcPos, srcPos + length);
                dest.set(uint8Array, destPos);
                expectedSize--;
                lb.offset--;
            }

            // update size
            session.size += expectedSize;

            for (; --expectedSize > 0; size >>>= 7)
                lb.buffer[offset++] = ((size & 0x7F) | 0x80);

            lb.buffer[offset] = (size);

            return rb;
        }

        // everything fits
        lb.offset = withIntOffset;

        const rb: LinkedBuffer = StringSerializer.writeUTF8_5(str, index, len, session, lb);

        let size: i32 = session.size - lastSize;

        if (size < lowerLimit) {
            // move one space to the left since the varint is 1-byte smaller
            let src: Uint8Array | Int8Array = lb.buffer;
            let srcPos: i32 = withIntOffset;
            let dest: Uint8Array | Int8Array = lb.buffer;
            let destPos: i32 = withIntOffset - 1;
            let length: i32 = lb.offset - withIntOffset;
            let uint8Array = src.slice(srcPos, srcPos + length);
            dest.set(uint8Array, destPos);
            expectedSize--;
            lb.offset--;
        }

        // update size
        session.size += expectedSize;

        for (; --expectedSize > 0; size >>>= 7)
            lb.buffer[offset++] = ((size & 0x7F) | 0x80);

        lb.buffer[offset] = (size);

        return rb;
    }

    private static writeUTF8_8(str: string, i: i32, len: i32,
        buffer: Uint8Array | Int8Array, offset: i32, limit: i32,
        session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        for (let c: i32 = 0; ; c = 0) {
            while (i != len && offset != limit && (c = str.charCodeAt(i++)) < 0x0080)
                buffer[offset++] = c;

            if (i == len && c < 0x0080) {
                session.size += (offset - lb.offset);
                lb.offset = offset;
                return lb;
            }

            if (offset == limit) {
                // we are done with this LinkedBuffer
                session.size += (offset - lb.offset);
                lb.offset = offset;

                if (lb.next == null) {
                    // reset
                    offset = 0;
                    limit = session.nextBufferSize;
                    buffer = new Uint8Array(limit);
                    // grow
                    lb = new LinkedBuffer(buffer, 0, 0, lb);
                }
                else {
                    // use the existing buffer from previous utf8 write.
                    // this condition happens only on streaming mode
                    lb = lb.next;
                    // reset
                    lb.offset = offset = lb.start;
                    buffer = lb.buffer;
                    limit = buffer.length;
                }

                continue;
            }

            if (c < 0x0800) {
                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0xC0 | ((c >> 6) & 0x1F));

                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0x80 | ((c >> 0) & 0x3F));
            }
            else if (isHighSurrogate(c) && i < len && isLowSurrogate(str.charCodeAt(i))) {
                // We have a surrogate pair, so use the 4-byte encoding.
                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                let codePoint: number = toCodePoint(c, str.charCodeAt(i));

                buffer[offset++] = (0xF0 | ((codePoint >> 18) & 0x07));

                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0x80 | ((codePoint >> 12) & 0x3F));

                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0x80 | ((codePoint >> 6) & 0x3F));

                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0x80 | ((codePoint >> 0) & 0x3F));

                i++;
            }
            else {
                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0xE0 | ((c >> 12) & 0x0F));

                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0x80 | ((c >> 6) & 0x3F));

                if (offset == limit) {
                    // we are done with this LinkedBuffer
                    session.size += (offset - lb.offset);
                    lb.offset = offset;

                    if (lb.next == null) {
                        // reset
                        offset = 0;
                        limit = session.nextBufferSize;
                        buffer = new Uint8Array(limit);
                        // grow
                        lb = new LinkedBuffer(buffer, 0, 0, lb);
                    }
                    else {
                        // use the existing buffer from previous utf8 write.
                        // this condition happens only on streaming mode
                        lb = lb.next;
                        // reset
                        lb.offset = offset = lb.start;
                        buffer = lb.buffer;
                        limit = buffer.length;
                    }
                }

                buffer[offset++] = (0x80 | ((c >> 0) & 0x3F));
            }
        }
    }
}
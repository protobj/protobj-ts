import { LinkedBuffer } from "./LinkedBuffer";
import { WriteSession } from "./WriteSession";
import { IntSerializer } from "./IntSerializer";
import { types } from "./extension";
import { StringSerializer } from "./StringSerializer";
import i16 = types.i16;
import u16 = types.u16;
import sf32 = types.sf32;
import i32 = types.i32;
import i8 = types.i8;
import u8 = types.u8;
import f32 = types.f32;
import f64 = types.f64;
import sf64 = types.sf64;
import u32 = types.u32;
import s32 = types.s32;
import u64 = types.u64;
import i64 = types.i64;
import s64 = types.s64;
import arraycopy = types.arraycopy;
import Long from "long";


export interface WriteSink {

    writeByteArray(value: Uint8Array | Int8Array, offset: i32, length: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer

    writeByte(value: i8 | u8, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeInt32LE(value: f32 | sf32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeInt64LE(value: f64 | sf64, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeVarInt32(value: i32 | u32 | s32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeVarInt64(value: i64 | u64 | s64 | i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeStrUTF8VarDelimited(value: string, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeInt16LE(value: i16 | u16, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

}

export class WriteSink_BUFFERED implements WriteSink {
    static INSTANCE: WriteSink = new WriteSink_BUFFERED();

    writeByte(value: i8, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        session.size++;

        if (lb.offset == lb.buffer.length) {
            // grow
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
        }
        lb.buffer[lb.offset++] = value;

        return lb;
    }

    writeByteArray(value: Uint8Array | Int8Array, offset: i32, valueLen: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        if (valueLen == 0)
            return lb;

        session.size += valueLen;

        const available: i32 = lb.buffer.length - lb.offset;
        if (valueLen > available) {
            if (available + session.nextBufferSize < valueLen) {
                // too large ... so we wrap and insert (zero-copy)
                if (available == 0) {
                    // buffer was actually full ... return a fresh buffer
                    return new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0,
                        new LinkedBuffer(value, offset, offset + valueLen, lb));
                }

                // continue with the existing byte array of the previous buffer
                return new LinkedBuffer(lb.buffer, lb.offset, lb.offset,
                    new LinkedBuffer(value, offset, offset + valueLen, lb));
            }

            // copy what can fit
            arraycopy(value, offset, lb.buffer, lb.offset, available);

            lb.offset += available;

            // grow
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);

            const leftover: i32 = valueLen - available;

            // copy what's left
            arraycopy(value, offset + available, lb.buffer, 0, leftover);

            lb.offset += leftover;

            return lb;
        }

        // it fits
        arraycopy(value, offset, lb.buffer, lb.offset, valueLen);

        lb.offset += valueLen;

        return lb;
    }


    writeInt32LE(value: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        session.size += 4;

        if (lb.offset + 4 > lb.buffer.length) {
            // grow
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
        }

        IntSerializer.writeInt32LE(value, lb.buffer, lb.offset);
        lb.offset += 4;

        return lb;
    }

    writeInt64LE(value: f64 | sf64, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        session.size += 8;

        if (lb.offset + 8 > lb.buffer.length) {
            // grow
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
        }

        IntSerializer.writeInt64LE(value, lb.buffer, lb.offset);
        lb.offset += 8;

        return lb;
    }

    writeStrUTF8VarDelimited(value: string, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        return StringSerializer.writeUTF8VarDelimited(value, session, lb);
    }

    writeVarInt32(value: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        while (true) {
            session.size++;
            if (lb.offset == lb.buffer.length) {
                // grow
                lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
            }

            if ((value & ~0x7F) == 0) {
                lb.buffer[lb.offset++] = value;
                return lb;
            }

            lb.buffer[lb.offset++] = ((value & 0x7F) | 0x80);
            value >>>= 7;
        }
    }

    writeVarInt64(value: Long, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        let high: number = value.high;
        let low: number = value.low;

        while (high) {
            if (lb.offset == lb.buffer.length) {
                lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
            }
            lb.buffer[lb.offset++] = low & 127 | 128;
            session.size++;
            low = (low >>> 7 | high << 25) >>> 0;
            high >>>= 7;
        }
        while (low > 127) {
            if (lb.offset == lb.buffer.length) {
                lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
            }
            session.size++;
            lb.buffer[lb.offset++] = low & 127 | 128;
            low = low >>> 7;
        }
        if (lb.offset == lb.buffer.length) {
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
        }
        lb.buffer[lb.offset++] = low;
        session.size++;
        return lb;
    }


    writeInt16LE(value: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer {
        session.size += 2;

        if (lb.offset + 2 > lb.buffer.length) {
            // grow
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);
        }

        IntSerializer.writeInt16LE(value, lb.buffer, lb.offset);
        lb.offset += 2;

        return lb;
    }
}
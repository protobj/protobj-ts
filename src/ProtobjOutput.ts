import { WriteSession } from "./WriteSession";
import { Output } from "./Output";
import { types } from "./extension";
import i32 = types.i32;
import u8 = types.u8;
import u64 = types.u64;
import u32 = types.u32;
import u16 = types.u16;
import sf64 = types.sf64;
import sf32 = types.sf32;
import s64 = types.s64;
import s32 = types.s32;
import i8 = types.i8;
import i64 = types.i64;
import float = types.float;
import f64 = types.f64;
import f32 = types.f32;
import i16 = types.i16;
import double = types.double;
import bool = types.bool;
import { LinkedBuffer } from "./LinkedBuffer";
import { WireFormat } from "./WireFormat";
import doubleToRawLongBits = types.doubleToRawLongBits;
import floatToRawIntBits = types.floatToRawIntBits;
import Long from "long";


export class ProtobjOutput extends WriteSession implements Output {

    constructor(buffer: LinkedBuffer) {
        super(buffer);
    }

    clear(): ProtobjOutput {
        super.clear();
        return this;
    }

    writeBOOL(fieldNumber: i32, value: bool): void {
        this.tail = this.sink.writeByte(value ? 0x01 : 0x00, this,
            this.sink.writeVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED8), this, this.tail));
    }

    writeBOOL_Packed(value: bool): void {
        this.tail = this.sink.writeByte(value ? 0x01 : 0x00, this, this.tail);
    }

    writeI8(fieldNumber: i32, value: i8): void {
        this.tail = this.sink.writeByte(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED8), this, this.tail));

    }

    writeI8_Packed(value: i8): void {
        this.tail = this.sink.writeByte(value, this, this.tail);
    }

    writeU8(fieldNumber: i32, value: u8): void {
        this.tail = this.sink.writeByte(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED8), this, this.tail));
    }

    writeU8_Packed(value: u8): void {
        this.tail = this.sink.writeByte(value, this, this.tail);
    }

    writeI16(fieldNumber: i32, value: i16): void {
        this.tail = this.sink.writeInt16LE(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED16), this, this.tail));
    }

    writeI16_Packed(value: i16): void {
        this.tail = this.sink.writeInt16LE(value, this, this.tail);
    }

    writeU16(fieldNumber: i32, value: u16): void {
        this.tail = this.sink.writeInt16LE(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED16), this, this.tail));
    }

    writeU16_Packed(value: u16): void {
        this.tail = this.sink.writeInt16LE(value, this, this.tail);
    }


    writeI32(fieldNumber: i32, value: i32): void {
        if (value < 0) {
            this.tail = this.sink.writeVarInt64(value, this, this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));
        } else {
            this.tail = this.sink.writeVarInt32(value, this, this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));
        }

    }

    writeI32_Packed(value: i32): void {
        if (value < 0) {
            this.tail = this.sink.writeVarInt64(value, this, this.tail);
        } else {
            this.tail = this.sink.writeVarInt32(value, this, this.tail);
        }

    }

    writeU32(fieldNumber: i32, value: u32): void {
        this.tail = this.sink.writeVarInt32(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));

    }

    writeU32_Packed(value: u32): void {
        this.tail = this.sink.writeVarInt32(value, this, this.tail);
    }

    writeS32(fieldNumber: i32, value: s32): void {
        this.tail = this.sink.writeVarInt32(ProtobjOutput.encodeZigZag32(value), this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));
    }

    writeS32_Packed(value: s32): void {
        this.tail = this.sink.writeVarInt32(ProtobjOutput.encodeZigZag32(value), this, this.tail);
    }

    writeF32(fieldNumber: i32, value: f32): void {
        this.tail = this.sink.writeInt32LE(value, this,
            this.sink.writeVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED32), this, this.tail));

    }

    writeF32_Packed(value: f32): void {
        this.tail = this.sink.writeInt32LE(value, this, this.tail);
    }

    writeSF32(fieldNumber: i32, value: sf32): void {
        this.tail = this.sink.writeInt32LE(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED32), this, this.tail));
    }

    writeSF32_Packed(value: sf32): void {
        this.tail = this.sink.writeInt32LE(value, this, this.tail);
    }

    writeI64(fieldNumber: i32, value: i64): void {
        this.tail = this.sink.writeVarInt64(value, this, this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));
    }

    writeI64_Packed(value: i64): void {
        this.tail = this.sink.writeVarInt64(value, this, this.tail);
    }


    writeU64(fieldNumber: i32, value: u64): void {
        this.tail = this.sink.writeVarInt64(value, this, this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));
    }

    writeU64_Packed(value: u64): void {
        this.tail = this.sink.writeVarInt64(value, this, this.tail);
    }

    writeS64(fieldNumber: i32, value: s64): void {
        this.tail = this.sink.writeVarInt64(ProtobjOutput.encodeZigZag64(value), this, this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_VARINT), this, this.tail));
    }

    writeS64_Packed(value: s64): void {
        this.tail = this.sink.writeVarInt64(ProtobjOutput.encodeZigZag64(value), this, this.tail);

    }

    writeF64(fieldNumber: i32, value: f64): void {
        this.tail = this.sink.writeInt64LE(value, this,
            this.sink.writeVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED64), this, this.tail));

    }

    writeF64_Packed(value: f64): void {
        this.tail = this.sink.writeInt64LE(value, this, this.tail);
    }

    writeSF64(fieldNumber: i32, value: sf64): void {
        this.tail = this.sink.writeInt64LE(value, this,
            this.sink.writeVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED64), this, this.tail));

    }

    writeSF64_Packed(value: sf64): void {
        this.tail = this.sink.writeInt64LE(value, this, this.tail);
    }

    writeSTRING(fieldNumber: i32, value: string): void {
        this.tail = this.sink.writeStrUTF8VarDelimited(value, this,
            this.sink.writeVarInt32(WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_LENGTH_DELIMITED), this, this.tail));
    }

    writeSTRING_Packed(value: string): void {
        this.tail = this.sink.writeStrUTF8VarDelimited(value, this, this.tail);
    }


    writeDOUBLE(fieldNumber: i32, value: double): void {
        this.tail = this.sink.writeInt64LE(doubleToRawLongBits(value), this,
            this.sink.writeVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED64), this, this.tail));

    }

    writeDOUBLE_Packed(value: double): void {
        this.tail = this.sink.writeInt64LE(doubleToRawLongBits(value), this, this.tail);
    }


    writeFLOAT(fieldNumber: i32, value: float): void {
        this.tail = this.sink.writeInt32LE(floatToRawIntBits(value),
            this, this.sink.writeVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_FIXED32), this, this.tail));

    }

    writeFLOAT_Packed(value: float): void {
        this.tail = this.sink.writeInt32LE(floatToRawIntBits(value), this, this.tail);
    }


    writeSet<T>(fieldNumber: i32, value: Set<T>, valueWriter: (v0: T) => void, output: Output = this): void {
        this.writeMessage(fieldNumber, () => {
            value.forEach(element => {
                valueWriter.call(output, element)
            });
        })
    }

    writeList<T>(fieldNumber: i32, value: Array<T>, valueWriter: (v0: T) => void, output: Output = this): void {
        this.writeMessage(fieldNumber, () => {
            for (let index = 0; index < value.length; index++) {
                valueWriter.call(output, value[index])
            }
        })
    }

    writeArray<T>(fieldNumber: i32, value: T[], valueWriter: (v0: T) => void, output: Output = this): void {
        this.writeMessage(fieldNumber, () => {
            this.writeI32_Packed(value.length);
            for (let index = 0; index < value.length; index++) {
                valueWriter.call(output, value[index]);
            }
        })
    }

    writeBOOLArray(fieldNumber: i32, value: bool[]): void {
        const length = ((value.length + 7) & (-8)) >>> 3;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < value.length; i++) {
            if (value[i]) {
                bytes[i / 8] |= 1 << (i % 8);
            }
        }
        this.writeMessage(fieldNumber, () => {
            this.writeI32_Packed(value.length);
            this.tail = this.sink.writeByteArray(bytes, 0, bytes.length, this, this.tail);
        });
    }

    writeBOOLList(fieldNumber: i32, value: Array<bool>) {
        this.writeBOOLArray(fieldNumber, value);
    }


    writeMessage(fieldNumber: i32, task: () => void) {
        let lastBuffer: LinkedBuffer;

        // write the tag
        if (fieldNumber < 16 && this.tail.offset != this.tail.buffer.length) {
            lastBuffer = this.tail;
            this.size++;
            lastBuffer.buffer[lastBuffer.offset++] =
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_LENGTH_DELIMITED);
        } else {
            this.tail = lastBuffer = ProtobjOutput.writeRawVarInt32(
                WireFormat.makeTag(fieldNumber, WireFormat.WIRETYPE_LENGTH_DELIMITED), this, this.tail);
        }

        const lastOffset = this.tail.offset, lastSize = this.size;

        if (lastOffset == lastBuffer.buffer.length) {
            // not enough size for the 1-byte delimiter
            const nextBuffer: LinkedBuffer = new LinkedBuffer(new Uint8Array(this.nextBufferSize));
            // new buffer for the content
            this.tail = nextBuffer;

            task();

            const msgSize: i32 = this.size - lastSize;

            const delimited: Uint8Array = new Uint8Array(ProtobjOutput.computeRawVarint32Size(msgSize));
            this.writeRawVarInt32_byteArray(msgSize, delimited, 0);

            this.size += delimited.length;

            // wrap the byte array (delimited) and insert between the two buffers
            new LinkedBuffer(delimited, 0, delimited.length, lastBuffer).next = nextBuffer;
            return;
        }

        // we have enough space for the 1-byte delim
        lastBuffer.offset++;
        this.size++;

        task();

        const msgSize: i32 = this.size - lastSize - 1;

        // optimize for small messages
        if (msgSize < 128) {
            // fits
            lastBuffer.buffer[lastOffset] = msgSize;
            return;
        }

        // split into two buffers

        // the second buffer (contains the message contents)
        const view: LinkedBuffer = new LinkedBuffer(lastBuffer.buffer,
            lastOffset + 1, lastBuffer.offset);

        if (lastBuffer == this.tail)
            this.tail = view;
        else
            view.next = lastBuffer.next;

        // the first buffer (contains the tag)
        lastBuffer.offset = lastOffset;

        const delimited: Uint8Array = new Uint8Array(ProtobjOutput.computeRawVarint32Size(msgSize));
        this.writeRawVarInt32_byteArray(msgSize, delimited, 0);

        // add the difference
        this.size += (delimited.length - 1);

        // wrap the byte array (delimited) and insert between the two buffers
        new LinkedBuffer(delimited, 0, delimited.length, lastBuffer).next = view;
    }

    writeMap<K, V>(fieldNumber: i32, value: Map<K, V>, keyWriter: (k0: K) => void, valueWrite: (v0: V) => void): void {
        this.writeMessage(fieldNumber, () => {
            value.forEach((v, k, map) => {
                if (v && k) {
                    keyWriter(k);
                    valueWrite(v);
                }
            }, this);
        });
    }


    private static encodeZigZag64(value: i64): s64 {
        const mask = value.high >> 31;
        const high = ((value.high << 1 | value.low >>> 31) ^ mask) >>> 0;
        const low = (value.low << 1 ^ mask) >>> 0;
        return Long.fromBits(low, high);
    }

    public static encodeZigZag32(n: i32): s32 {
        // Note: the right-shift must be arithmetic
        return (n << 1) ^ (n >> 31);
    }

    private static writeRawVarInt32(value: i32, session: ProtobjOutput,
        lb: LinkedBuffer): LinkedBuffer {
        const size: i32 = ProtobjOutput.computeRawVarint32Size(value);

        if (lb.offset + size > lb.buffer.length)
            lb = new LinkedBuffer(new Uint8Array(session.nextBufferSize), 0, 0, lb);

        const buffer: Uint8Array | Int8Array = lb.buffer;
        let offset: i32 = lb.offset;
        lb.offset += size;
        session.size += size;

        if (size == 1)
            buffer[offset] = value;
        else {
            for (let i = 0, last = size - 1; i < last; i++, value >>>= 7)
                buffer[offset++] = ((value & 0x7F) | 0x80);

            buffer[offset] = value;
        }

        return lb;
    }


    private static computeRawVarint32Size(value: i32) {
        if ((value & (0xffffffff << 7)) == 0)
            return 1;
        if ((value & (0xffffffff << 14)) == 0)
            return 2;
        if ((value & (0xffffffff << 21)) == 0)
            return 3;
        if ((value & (0xffffffff << 28)) == 0)
            return 4;
        return 5;
    }


    private writeRawVarInt32_byteArray(value: i32, buf: Uint8Array, offset: number) {
        while (true) {
            if ((value & ~0x7F) == 0) {
                buf[offset] = value;
                return;
            } else {
                buf[offset++] = ((value & 0x7F) | 0x80);
                value >>>= 7;
            }
        }
    }


}
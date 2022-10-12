import { Input } from "./Input";
import { ProtobjError } from "./ProtobjError";
import { WireFormat } from "./WireFormat";

import { types } from "./extension";
import i32 = types.i32;
import f64 = types.f64;
import f32 = types.f32;
import float = types.float;
import double = types.double;
import i16 = types.i16;
import i64 = types.i64;
import i8 = types.i8;
import s32 = types.s32;
import s64 = types.s64;
import sf32 = types.sf32;
import sf64 = types.sf64;
import u16 = types.u16;
import u32 = types.u32;
import u64 = types.u64;
import u8 = types.u8;
import bool = types.bool;
import longBitsToDouble = types.longBitsToDouble;
import intBitsToFloat = types.intBitsToFloat;
import Long from "long";
import {read} from "@protobufjs/utf8";

export class ProtobjInput implements Input {

    private buffer: Uint8Array;
    private offset: i32 = 0;
    private limit: i32 = 0;
    private lastTag: i32 = 0;
    private packedLimit: i32 = 0;

    constructor(buffer: Uint8Array, offset: i32 = 0, len: i32 = buffer.length) {
        this.buffer = buffer;
        this.offset = offset;
        this.limit = offset + len;
    }


    public reset(offset: i32, len: i32): ProtobjInput {
        if (len < 0) {
            throw new Error("length cannot be negative.");
        }
        this.offset = offset;
        this.limit = offset + len;
        this.packedLimit = 0;
        return this;
    }

    public setBounds(offset: i32, limit: i32): ProtobjInput {
        this.offset = offset;
        this.limit = limit;
        this.packedLimit = 0;
        return this;
    }

    public currentOffset(): i32 {
        return this.offset;
    }

    public currentLimit(): i32 {
        return this.limit;
    }

    public isCurrentFieldPacked(): boolean {
        return this.packedLimit != 0 && this.packedLimit != this.offset;
    }

    public getLastTag(): i32 {
        return this.lastTag;
    }

    public skipField(tag: i32): boolean {
        switch (WireFormat.getTagWireType(tag)) {
            case WireFormat.WIRETYPE_VARINT: {
                this.readI32();
                return true;
            }
            case WireFormat.WIRETYPE_FIXED64: {
                this.readRawLittleEndian64();
                return true;
            }
            case WireFormat.WIRETYPE_LENGTH_DELIMITED: {
                const size: i32 = this.readRawVarint32();
                if (size < 0) {
                    ProtobjError.negativeSize();
                }
                this.offset += size;
                return true;
            }
            case WireFormat.WIRETYPE_FIXED8: {
                this.readI8();
                return true;
            }
            case WireFormat.WIRETYPE_FIXED16:
                this.readI16();
                return false;
            case WireFormat.WIRETYPE_FIXED32: {
                this.readRawLittleEndian32();
                return true;
            }
            default: {
                ProtobjError.invalidWireType();
                return false
            }
        }
    }

    private readRawVarint32(): i32 {
        const buffer = this.buffer;
        let tmp: i8 = buffer[this.offset++];
        if (tmp >= 0) {
            return tmp;
        }
        let result: i32 = tmp & 0x7f;
        if ((tmp = buffer[this.offset++]) >= 0) {
            result |= tmp << 7;
        } else {
            result |= (tmp & 0x7f) << 7;
            if ((tmp = buffer[this.offset++]) >= 0) {
                result |= tmp << 14;
            } else {
                result |= (tmp & 0x7f) << 14;
                if ((tmp = buffer[this.offset++]) >= 0) {
                    result |= tmp << 21;
                } else {
                    result |= (tmp & 0x7f) << 21;
                    result |= (tmp = buffer[this.offset++]) << 28;
                    if (tmp < 0) {
                        // Discard upper 32 
                        for (let i = 0; i < 5; i++) {
                            if (buffer[this.offset++] >= 0) {
                                return result;
                            }
                        }
                        throw ProtobjError.malformedVarint();
                    }
                }
            }
        }
        return result;
    }

    private readRawLittleEndian64(): Long {
        let buffer: Uint8Array = this.buffer;
        let offset: i32 = this.offset;
        let b1: i8 = buffer[offset++];
        let b2: i8 = buffer[offset++];
        let b3: i8 = buffer[offset++];
        let b4: i8 = buffer[offset++];
        let b5: i8 = buffer[offset++];
        let b6: i8 = buffer[offset++];
        let b7: i8 = buffer[offset++];
        let b8: i8 = buffer[offset++];
        this.offset = offset;
        return Long.fromBytesLE([b1, b2, b3, b4, b5, b6, b7, b8], false);

    }

    private readRawLittleEndian32(): i32 {
        let buffer: Uint8Array = this.buffer;
        let offset: i32 = this.offset;
        let b1: i8 = buffer[offset++];
        let b2: i8 = buffer[offset++];
        let b3: i8 = buffer[offset++];
        let b4: i8 = buffer[offset++];
        this.offset = offset;
        return ((b1 & 0xff)) |
            ((b2 & 0xff) << 8) |
            ((b3 & 0xff) << 16) |
            ((b4 & 0xff) << 24);

    }

    handleUnknownField(fieldNumber: i32): void {
        this.skipField(this.lastTag);
    }


    readBytes(): Uint8Array {

        let length: i32 = this.readRawVarint32();
        if (length < 0) {
            throw ProtobjError.negativeSize();
        }
        if (this.offset + length > this.limit) {
            throw ProtobjError.misreportedSize();
        }
        return this.buffer.slice(this.offset, this.offset = this.offset + length);
    }

    readFieldNumber<T>(): i32 {
        if (this.offset == this.limit) {
            this.lastTag = 0;
            return 0;
        }

        this.packedLimit = 0;
        const tag: i32 = this.readRawVarint32();
        const fieldNumber: i32 = WireFormat.getTagFieldNumber(tag);
        if (fieldNumber == 0) {
            throw ProtobjError.invalidTag();
        }
        this.lastTag = tag;
        return fieldNumber;
    }

    private checkIfPackedField(): void {
        if (this.packedLimit == 0 && WireFormat.getTagWireType(this.lastTag) == WireFormat.WIRETYPE_LENGTH_DELIMITED) {
            const length: i32 = this.readRawVarint32();
            if (length < 0) {
                throw ProtobjError.negativeSize();
            }
            if (this.offset + length > this.limit) {
                throw ProtobjError.misreportedSize();
            }
            this.packedLimit = this.offset + length;
        }
    }

    private readRawVarint64(): Long {
        const buffer: Uint8Array = this.buffer;
        let offset: i32 = this.offset;
        let [lo, hi]: [i32, i32] = [0, 0];
        let i: i32 = 0;
        if (this.limit - this.offset > 4) { // fast route (lo)
            for (; i < 4; ++i) {
                // 1st..4th
                lo = (lo | (buffer[offset] & 127) << i * 7) >>> 0;
                if (buffer[offset++] < 128) {
                    this.offset = offset;
                    return Long.fromBits(lo, hi);
                }
            }
            // 5th
            lo = (lo | (buffer[offset] & 127) << 28) >>> 0;
            hi = (hi | (buffer[offset] & 127) >> 4) >>> 0;
            if (buffer[offset++] < 128) {
                this.offset = offset;
                return Long.fromBits(lo, hi);
            }
            i = 0;
        } else {
            for (; i < 3; ++i) {
                /* istanbul ignore if */
                if (offset >= this.limit)
                    throw ProtobjError.misreportedSize()
                // 1st..3th
                lo = (lo | (buffer[offset] & 127) << i * 7) >>> 0;
                if (buffer[offset++] < 128) {
                    this.offset = offset;
                    return Long.fromBits(lo, hi);
                }

            }
            // 4th
            lo = (lo | (buffer[offset++] & 127) << i * 7) >>> 0;
            this.offset = offset;
            return Long.fromBits(lo, hi);
        }
        if (this.limit - offset > 4) { // fast route (hi)
            for (; i < 5; ++i) {
                // 6th..10th
                hi = (hi | (buffer[offset] & 127) << i * 7 + 3) >>> 0;
                if (buffer[offset++] < 128) {
                    this.offset = offset;
                    return Long.fromBits(lo, hi);
                }
            }
        } else {
            for (; i < 5; ++i) {
                /* istanbul ignore if */
                if (offset >= this.limit)
                    throw ProtobjError.misreportedSize()
                // 6th..10th
                hi = (hi | (buffer[offset] & 127) << i * 7 + 3) >>> 0;
                if (buffer[offset++] < 128) {
                    this.offset = offset;
                    return Long.fromBits(lo, hi);
                }
            }
        }
        throw ProtobjError.malformedVarint();
    }

    readBOOL(): bool {
        this.checkIfPackedField()
        return this.buffer[this.offset++] != 0;
    }

    readBOOL_NoCheck(): bool {
        return this.buffer[this.offset++] != 0;
    }

    readMap<K, V>(keyReader: () => K, valueReader: () => V, input: Input = this): Map<K, V> {
        this.checkIfPackedField();
        const value = new Map<K, V>();
        do {
            value.set(keyReader.call(input), valueReader.call(input));
        } while (this.offset < this.packedLimit);
        return value;
    }

    readArray<T>(valueReader: () => T, input: Input = this): T[] {
        const len = this.readI32();
        const values: T[] = new Array<T>(len);
        for (let i = 0; i < values.length; i++) {
            values[i] = valueReader.call(input);
        }
        return values;
    }

    readDOUBLE(): double {
        this.checkIfPackedField()
        return longBitsToDouble(this.readRawLittleEndian64());
    }

    readDOUBLE_NoCheck(): double {
        return longBitsToDouble(this.readRawLittleEndian64());
    }

    readF32(): f32 {
        this.checkIfPackedField();
        return this.readRawLittleEndian32();
    }

    readF32_NoCheck(): f32 {
        return this.readRawLittleEndian32();
    }

    readF64(): f64 {
        this.checkIfPackedField()
        return this.readRawLittleEndian64();
    }

    readF64_NoCheck(): f64 {
        return this.readRawLittleEndian64();
    }

    readFLOAT(): float {
        this.checkIfPackedField()
        return intBitsToFloat(this.readRawLittleEndian32());
    }

    readFLOAT_NoCheck(): float {
        return intBitsToFloat(this.readRawLittleEndian32());
    }

    readI16(): i16 {
        this.checkIfPackedField();
        return this.readRawLittleEndian16();
    }

    readI16_NoCheck(): i16 {
        return this.readRawLittleEndian16();
    }

    readI32(): i32 {
        this.checkIfPackedField()
        return this.readRawVarint32();
    }

    readI32_NoCheck(): i32 {
        return this.readRawVarint32();
    }

    readI64(): i64 {
        this.checkIfPackedField()
        return this.readRawVarint64();
    }

    readI64_NoCheck(): i64 {
        return this.readRawVarint64();
    }

    readI8(): i8 {
        this.checkIfPackedField();
        return this.buffer[this.offset++];
    }

    readI8_NoCheck(): i8 {
        return this.buffer[this.offset++];
    }

    readS32(): s32 {
        this.checkIfPackedField()
        const n: i32 = this.readRawVarint32();
        return (n >>> 1) ^ (-(n & 1));
    }

    readS32_NoCheck(): s32 {
        const n: i32 = this.readRawVarint32();
        return (n >>> 1) ^ (-(n & 1));
    }

    readS64(): s64 {
        this.checkIfPackedField();
        return this.readS64_NoCheck()
    }

    readS64_NoCheck(): s64 {
        const n: Long = this.readRawVarint64();
        const mask = -(n.low & 1);
        n.low = ((n.low >>> 1 | n.high << 31) ^ mask) >>> 0;
        n.high = (n.high >>> 1 ^ mask) >>> 0;
        return n;
    }

    readSF32(): sf32 {
        this.checkIfPackedField()
        return this.readRawLittleEndian32();
    }

    readSF32_NoCheck(): sf32 {
        return this.readRawLittleEndian32();
    }

    readSF64(): sf64 {
        this.checkIfPackedField();
        return this.readRawLittleEndian64();
    }

    readSF64_NoCheck(): sf64 {
        return this.readRawLittleEndian64();
    }

    readSTRING(): string {
        const length: i32 = this.readRawVarint32();
        if (length < 0)
            throw ProtobjError.negativeSize();

        if (this.offset + length > this.limit)
            throw ProtobjError.misreportedSize();
        return read(this.buffer, this.offset, this.offset = this.offset + length)

    }

    readSTRING_NoCheck(): string {
        return this.readSTRING();
    }


    readU16(): u16 {
        this.checkIfPackedField();
        return this.readRawLittleEndian16();
    }

    readU16_NoCheck(): u16 {
        return this.readRawLittleEndian16();
    }

    readU32(): u32 {
        this.checkIfPackedField();
        return this.readRawVarint32();
    }

    readU32_NoCheck(): u32 {
        return this.readRawVarint32();
    }

    readU64(): u64 {
        this.checkIfPackedField();
        return this.readRawVarint64();
    }

    readU64_NoCheck(): u64 {
        return this.readRawVarint64();
    }

    readU8(): u8 {
        this.checkIfPackedField();
        return this.buffer[this.offset++];
    }

    readU8_NoCheck(): u8 {
        return this.buffer[this.offset++];
    }

    readRawLittleEndian16(): i16 | u16 {
        const buffer: Uint8Array = this.buffer;
        let offset = this.offset;

        let b1: u8 = buffer[offset++];
        let b2: u8 = buffer[offset++];
        this.offset = offset;

        return (((b1 & 0xff)) | ((b2 & 0xff) << 8));
    }

    readList<T>(valueReader: () => T, input: Input = this): Array<T> {
        this.checkIfPackedField();
        const value = new Array<T>();

        do {
            value.push(valueReader.call(input));
        } while (this.offset < this.packedLimit);
        return value;
    }


    readSet<T>(valueReader: () => T, input: Input = this): Set<T> {
        this.checkIfPackedField();
        const value = new Set<T>();
        do {
            value.add(valueReader.call(input));
        } while (this.offset < this.packedLimit);
        return value;
    }

    readMessageStart(): i32 {
        const length = this.readRawVarint32();
        if (length < 0)
            throw ProtobjError.negativeSize();
        // save old limit
        const oldLimit = this.limit;
        this.limit = this.offset + length;
        this.packedLimit = this.limit;
        return oldLimit;
    }

    readMessageStop(oldLimit: i32) {
        if (this.offset != this.limit) {
            throw ProtobjError.misreportedSize();
        }
        //restore limit
        this.limit = oldLimit;
        this.lastTag = 0;
    }

}
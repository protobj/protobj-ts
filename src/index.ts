import Long from 'long';
import utf8 from "@protobufjs/utf8";

export  type bool = boolean;
export  type i8 = number;
export  type u8 = number;
export  type i16 = number;
export  type u16 = number;
export  type i32 = number;
export  type u32 = number;
export  type s32 = number;
export  type f32 = number;
export  type sf32 = number;
export  type i64 = Long;
export  type u64 = Long;
export  type s64 = Long;
export  type f64 = Long;
export  type sf64 = Long;
export  type float = number;
export  type double = number;

function floatToRawIntBits(val: float): i32 {
    const sign = val < 0 ? 1 : 0;
    if (sign)
        val = -val;
    if (val === 0) {
        return 1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648;
    } else if (isNaN(val))
        return 2143289344;
    else if (val > 3.4028234663852886e+38) // +-Infinity
        return (sign << 31 | 2139095040) >>> 0;
    else if (val < 1.1754943508222875e-38) // denormal
        return (sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0;
    else {
        var exponent = Math.floor(Math.log(val) / Math.LN2),
            mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
        return (sign << 31 | exponent + 127 << 23 | mantissa) >>> 0;
    }
}

function intBitsToFloat(value: i32): float {
    const sign = (value >> 31) * 2 + 1,
        exponent = value >>> 23 & 255,
        mantissa = value & 8388607;
    return exponent === 255
        ? mantissa
            ? NaN
            : sign * Infinity
        : exponent === 0 // denormal
            ? sign * 1.401298464324817e-45 * mantissa
            : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
}


function doubleToRawLongBits(val: double): Long {
    const sign = val < 0 ? 1 : 0;
    if (sign)
        val = -val;
    if (val === 0) {
        return Long.fromBits(0, 1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648);
    } else if (isNaN(val)) {
        return Long.fromBits(0, 2146959360);
    } else if (val > 1.7976931348623157e+308) { // +-Infinity
        return Long.fromBits(0, (sign << 31 | 2146435072) >>> 0)
    } else {
        let mantissa;
        if (val < 2.2250738585072014e-308) { // denormal
            mantissa = val / 5e-324;
            return Long.fromBits(mantissa >>> 0, (sign << 31 | mantissa / 4294967296) >>> 0);
        } else {
            let exponent = Math.floor(Math.log(val) / Math.LN2);
            if (exponent === 1024)
                exponent = 1023;
            mantissa = val * Math.pow(2, -exponent);
            return Long.fromBits(mantissa * 4503599627370496 >>> 0, (sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0);
        }
    }
}

function longBitsToDouble(value: Long): double {
    const lo = value.low;
    const hi = value.high;
    const sign = (hi >> 31) * 2 + 1,
        exponent = hi >>> 20 & 2047,
        mantissa = 4294967296 * (hi & 1048575) + lo;
    return exponent === 2047
        ? mantissa
            ? NaN
            : sign * Infinity
        : exponent === 0 // denormal
            ? sign * 5e-324 * mantissa
            : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
}

const MIN_HIGH_SURROGATE: number = parseInt('\uD800', 16);


const MAX_HIGH_SURROGATE: number = parseInt('\uDBFF', 16);


const MIN_LOW_SURROGATE: number = parseInt('\uDC00', 16);


const MAX_LOW_SURROGATE: number = parseInt('\uDFFF', 16);


const MIN_SUPPLEMENTARY_CODE_POINT: number = 0x010000;

function isHighSurrogate(ch: number): boolean {
    return ch >= MIN_HIGH_SURROGATE && ch < (MAX_HIGH_SURROGATE + 1);
}

function isLowSurrogate(ch: number): boolean {
    return ch >= MIN_LOW_SURROGATE && ch < (MAX_LOW_SURROGATE + 1);
}

function toCodePoint(high: number, low: number): number {
    return ((high << 10) + low) + (MIN_SUPPLEMENTARY_CODE_POINT
        - (MIN_HIGH_SURROGATE << 10)
        - MIN_LOW_SURROGATE);
}

function arraycopy(src: Uint8Array | Int8Array, srcPos: i32, dest: Uint8Array | Int8Array, destPos: i32, length: i32) {
    dest.set(src.slice(srcPos, srcPos + length), destPos);
}

class IntSerializer {
    private constructor() {
    }


    public static writeInt16LE(value: i32, buffer: Uint8Array | Int8Array, offset: i32): void {
        buffer[offset] = ((value >>> 8) & 0xFF);
    }


    /**
     * Writes the 32-bit int into the buffer starting with the least significant byte.
     */
    public static writeInt32LE(value: i32, buffer: Uint8Array | Int8Array, offset: i32): void {
        buffer[offset++] = ((value >>> 0) & 0xFF);
        buffer[offset++] = ((value >>> 8) & 0xFF);
        buffer[offset++] = ((value >>> 16) & 0xFF);
        buffer[offset] = ((value >>> 24) & 0xFF);
    }

    /**
     * Writes the 64-bit int into the buffer starting with the least significant byte.
     */
    public static writeInt64LE(value: f64 | sf64, buffer: Uint8Array | Int8Array, offset: i32): void {
        buffer.set(value.toBytesLE(), offset);
    }
}

export interface Input {
    handleUnknownField(fieldNumber: i32): void;

    readFieldNumber(): i32;

    readBOOL(): bool;

    readBOOL_NoCheck(): bool;

    readI8(): i8;

    readI8_NoCheck(): i8;

    readU8(): u8;

    readU8_NoCheck(): u8;

    readI16(): i16;

    readI16_NoCheck(): i16;

    readU16(): u16;

    readU16_NoCheck(): u16;

    readI32(): i32;

    readI32_NoCheck(): i32;

    readU32(): u32;

    readU32_NoCheck(): u32;

    readS32(): s32;

    readS32_NoCheck(): s32;

    readF32(): f32;

    readF32_NoCheck(): f32;

    readSF32(): sf32;

    readSF32_NoCheck(): sf32;

    readI64(): i64;

    readI64_NoCheck(): i64;

    readU64(): u64;

    readU64_NoCheck(): u64;

    readS64(): s64;

    readS64_NoCheck(): s64;

    readF64(): f64;

    readF64_NoCheck(): f64;

    readSF64(): sf64;

    readSF64_NoCheck(): sf64;

    readSTRING(): string;

    readSTRING_NoCheck(): string;

    readDOUBLE(): double;

    readDOUBLE_NoCheck(): double;

    readFLOAT(): float;

    readFLOAT_NoCheck(): float;

    readMap<K, V>(keyReader: () => K, valueReader: () => V): Map<K, V>;

    readArray<T>(valueReader: () => T): T[];

    readSet<T>(valueReader: () => T): Set<T>;

    readList<T>(valueReader: () => T): Array<T>;

    readMessageStart(): i32;

    readMessageStop(oldLimit: i32): void;

}

export class LinkedBuffer {
    static MIN_BUFFER_SIZE = 256;
    static DEFAULT_BUFFER_SIZE = 512;

    buffer: Uint8Array | Int8Array;
    start: number;
    offset: number;
    next: LinkedBuffer | null;

    constructor(buffer: Uint8Array | Int8Array, start: number = 0, offset: number = 0, appendTarget?: LinkedBuffer) {
        this.buffer = buffer;
        this.start = start;
        this.offset = offset;
        if (appendTarget) {
            this.next = appendTarget;
        } else {
            this.next = null;
        }
    }

    public clear(): LinkedBuffer {
        this.next = null;
        this.offset = this.start;
        return this;
    }

    public static allocate(size: number = this.MIN_BUFFER_SIZE) {
        if (size < this.MIN_BUFFER_SIZE) {
            size = this.MIN_BUFFER_SIZE;
        }
        return new LinkedBuffer(new Uint8Array(size));
    }

}

export interface Output {

    writeBOOL(fieldNumber: i32, value: bool): void

    writeBOOL_Packed(value: bool): void

    writeI8(fieldNumber: i32, value: i8): void

    writeI8_Packed(value: i8): void

    writeU8(fieldNumber: i32, value: u8): void

    writeU8_Packed(value: u8): void

    writeI16(fieldNumber: i32, value: i16): void

    writeI16_Packed(value: i16): void

    writeU16(fieldNumber: i32, value: u16): void

    writeU16_Packed(value: u16): void

    writeI32(fieldNumber: i32, value: i32): void

    writeI32_Packed(value: i32): void

    writeU32(fieldNumber: i32, value: u32): void

    writeU32_Packed(value: u32): void

    writeS32(fieldNumber: i32, value: s32): void

    writeS32_Packed(value: s32): void

    writeF32(fieldNumber: i32, value: f32): void

    writeF32_Packed(value: f32): void

    writeSF32(fieldNumber: i32, value: sf32): void

    writeSF32_Packed(value: sf32): void

    writeI64(fieldNumber: i32, value: i64): void

    writeI64_Packed(value: i64): void

    writeU64(fieldNumber: i32, value: u64): void

    writeU64_Packed(value: u64): void

    writeS64(fieldNumber: i32, value: s64): void

    writeS64_Packed(value: s64): void

    writeF64(fieldNumber: i32, value: f64): void

    writeF64_Packed(value: f64): void

    writeSF64(fieldNumber: i32, value: sf64): void

    writeSF64_Packed(value: sf64): void

    writeSTRING(fieldNumber: i32, value: string): void

    writeSTRING_Packed(value: string): void

    writeDOUBLE(fieldNumber: i32, value: double): void

    writeDOUBLE_Packed(value: double): void

    writeFLOAT(fieldNumber: i32, value: float): void

    writeFLOAT_Packed(value: float): void


    writeMessage(fieldNumber: i32, task: () => void): void

    writeSet<T>(fieldNumber: i32, value: Set<T>, valueWriter: (v0: T) => void): void

    writeList<T>(fieldNumber: i32, value: Array<T>, valueWriter: (v0: T) => void): void

    writeArray<T>(fieldNumber: i32, value: T[], valueWriter: (v0: T) => void): void

    writeBOOLArray(fieldNumber: i32, value: bool[]): void

    writeBOOLList(fieldNumber: i32, value: Array<bool>): void

    writeMap<K, V>(fieldNumber: i32, value: Map<K, V>, keyWriter: (k0: K) => void, valueWrite: (v0: V) => void): void

}

class ProtobjError extends Error {

    constructor(message: string) {
        super(message);
    }

    private static ERR_TRUNCATED_MESSAGE: string =
        "While parsing a protocol message, the input ended unexpectedly " +
        "in the middle of a field.  This could mean either than the " +
        "input has been truncated or that an embedded message " +
        "misreported its own length.";

    public static truncatedMessage(cause: Error | undefined = undefined): ProtobjError {
        if (cause == undefined) {
            return new ProtobjError(this.ERR_TRUNCATED_MESSAGE);
        }
        return new ProtobjError(this.ERR_TRUNCATED_MESSAGE + " \t" + cause.message + "\n" + cause.stack);
    }

    public static misreportedSize(): ProtobjError {
        return new ProtobjError(
            "CodedInput encountered an embedded string or bytes " +
            "that misreported its size.");
    }

    public static negativeSize(): ProtobjError {
        return new ProtobjError(
            "CodedInput encountered an embedded string or message " +
            "which claimed to have negative size.");
    }

    public static malformedVarint(): ProtobjError {
        return new ProtobjError(
            "CodedInput encountered a malformed varint.");
    }

    public static invalidTag(): ProtobjError {
        return new ProtobjError(
            "Protocol message contained an invalid tag (zero).");
    }

    public static invalidEndTag(): ProtobjError {
        return new ProtobjError(
            "Protocol message end-group tag did not match expected tag.");
    }

    public static invalidWireType(): ProtobjError {
        return new ProtobjError(
            "Protocol message tag had invalid wire type.");
    }

    public static recursionLimitExceeded(): ProtobjError {
        return new ProtobjError(
            "Protocol message had too many levels of nesting.  May be malicious.  " +
            "Use CodedInput.setRecursionLimit() to increase the depth limit.");
    }

    public static sizeLimitExceeded(): ProtobjError {
        return new ProtobjError(
            "Protocol message was too large.  May be malicious.  " +
            "Use CodedInput.setSizeLimit() to increase the size limit.");
    }
}

export class WriteSession {

    public head: LinkedBuffer;

    protected tail: LinkedBuffer;

    public size: i32 = 0;

    public nextBufferSize: i32;

    protected sink: WriteSink;

    constructor(head: LinkedBuffer, nextBufferSize: i32 = LinkedBuffer.DEFAULT_BUFFER_SIZE) {
        this.tail = head;
        this.head = head;
        this.nextBufferSize = nextBufferSize;
        this.sink = WriteSink_BUFFERED.INSTANCE;
    }


    public clear(): WriteSession {
        this.tail = this.head.clear();
        this.size = 0;
        return this;
    }

    public toByteArray(): Uint8Array {
        let node: LinkedBuffer | null = this.head;
        let offset: i32 = 0;
        let len: i32;

        const buf: Uint8Array = new Uint8Array(this.size);
        do {
            if ((len = node.offset - node.start) > 0) {
                // console.log("size:", this.size);
                // console.log("offset:", offset);
                // console.log("start:", node.start, " offset:", node.offset)
                buf.set(node.buffer.slice(node.start, node.start + len), offset);
                offset += len;
            }
        } while ((node = node.next) != null);
        return buf;
    }
}

interface WriteSink {

    writeByteArray(value: Uint8Array | Int8Array, offset: i32, length: i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer

    writeByte(value: i8 | u8, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeInt32LE(value: f32 | sf32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeInt64LE(value: f64 | sf64, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeVarInt32(value: i32 | u32 | s32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeVarInt64(value: i64 | u64 | s64 | i32, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeStrUTF8VarDelimited(value: string, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

    writeInt16LE(value: i16 | u16, session: WriteSession, lb: LinkedBuffer): LinkedBuffer;

}


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
        return utf8.read(this.buffer, this.offset, this.offset = this.offset + length)

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

class WireFormat {
    public static WIRETYPE_VARINT: i32 = 0;
    public static WIRETYPE_FIXED64: i32 = 1;
    public static WIRETYPE_LENGTH_DELIMITED: i32 = 2;
    public static WIRETYPE_FIXED8: i32 = 3;
    public static WIRETYPE_FIXED16: i32 = 4;
    public static WIRETYPE_FIXED32: i32 = 5;

    public static TAG_TYPE_BITS: i32 = 3;
    public static TAG_TYPE_MASK: i32 = (1 << this.TAG_TYPE_BITS) - 1;


    public static getTagWireType(tag: i32): i32 {
        return tag & this.TAG_TYPE_MASK;
    }

    public static getTagFieldNumber(tag: i32): i32 {
        return tag >>> this.TAG_TYPE_BITS;
    }

    public static makeTag(fieldNumber: i32, wireType: i32): i32 {
        return (fieldNumber << this.TAG_TYPE_BITS) | wireType;
    }
}

class WriteSink_BUFFERED implements WriteSink {
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

class StringSerializer {

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
                } else {
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
                    } else {
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
                    } else {
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
            } else if (isHighSurrogate(c) && i < len && isLowSurrogate(str.charCodeAt(i))) {
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
                    } else {
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
                    } else {
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
                    } else {
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
                    } else {
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
            } else {
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
                    } else {
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
                    } else {
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
                    } else {
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

export interface Schema {
    writeTo(output: Output, message: any, polymorphic: boolean): void;

    mergeFrom(input: Input, message: any): any;
}

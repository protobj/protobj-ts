import { types } from "./extension";
import i32 = types.i32;
import sf64 = types.sf64;
import float = types.float;
import double = types.double;
import f64 = types.f64;
import u64 = types.u64;
import i64 = types.i64;
import s64 = types.s64;
import bool = types.bool;
import i8 = types.i8;
import u8 = types.u8;
import i16 = types.i16;
import u16 = types.u16;
import u32 = types.u32;
import s32 = types.s32;
import f32 = types.f32;
import sf32 = types.sf32;


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
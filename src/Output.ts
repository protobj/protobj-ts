import { types } from "./extension";
import bool = types.bool;
import i8 = types.i8;
import u8 = types.u8;
import i16 = types.i16;
import u16 = types.u16;
import u32 = types.u32;
import s32 = types.s32;
import sf32 = types.sf32;
import i64 = types.i64;
import u64 = types.u64;
import s64 = types.s64;
import sf64 = types.sf64;
import float = types.float;
import double = types.double;
import i32 = types.i32;
import f32 = types.f32;
import f64 = types.f64;

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


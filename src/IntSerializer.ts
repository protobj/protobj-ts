import i32 = types.i32;
import { types } from "./extension";
import f64 = types.f64
import sf64 = types.sf64
export class IntSerializer {
    private constructor() { }


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
        // buffer[offset++] = (byte)(value >>> 0);
        // buffer[offset++] = (byte)(value >>> 8);
        // buffer[offset++] = (byte)(value >>> 16);
        // buffer[offset++] = (byte)(value >>> 24);
        // buffer[offset++] = (byte)(value >>> 32);
        // buffer[offset++] = (byte)(value >>> 40);
        // buffer[offset++] = (byte)(value >>> 48);
        // buffer[offset] = (byte)(value >>> 56);
    }
}
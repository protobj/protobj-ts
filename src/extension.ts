import Long from "long";

// deno-lint-ignore no-namespace
export namespace types {
    export type bool = boolean;
    export type i8 = number;
    export type u8 = number;
    export type i16 = number;
    export type u16 = number;
    export type i32 = number;
    export type u32 = number;
    export type s32 = number;
    export type f32 = number;
    export type sf32 = number;
    export type i64 = Long;
    export type u64 = Long;
    export type s64 = Long;
    export type f64 = Long;
    export type sf64 = Long;
    export type float = number;
    export type double = number;

    export function floatToRawIntBits(val: float): i32 {
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

    export function intBitsToFloat(value: i32): float {
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


    export function doubleToRawLongBits(val: double): Long {
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

    export function longBitsToDouble(value: Long): double {
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

    export function isHighSurrogate(ch: number): boolean {
        return ch >= MIN_HIGH_SURROGATE && ch < (MAX_HIGH_SURROGATE + 1);
    }

    export function isLowSurrogate(ch: number): boolean {
        return ch >= MIN_LOW_SURROGATE && ch < (MAX_LOW_SURROGATE + 1);
    }

    export function toCodePoint(high: number, low: number): number {
        return ((high << 10) + low) + (MIN_SUPPLEMENTARY_CODE_POINT
            - (MIN_HIGH_SURROGATE << 10)
            - MIN_LOW_SURROGATE);
    }

    export function arraycopy(src: Uint8Array | Int8Array, srcPos: i32, dest: Uint8Array | Int8Array, destPos: i32, length: i32) {
        dest.set(src.slice(srcPos, srcPos + length), destPos);
    }
}
import { types } from "./extension";
import i32 = types.i32;


export class WireFormat {
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

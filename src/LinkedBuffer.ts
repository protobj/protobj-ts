
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
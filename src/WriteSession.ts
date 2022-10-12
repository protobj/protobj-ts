import { LinkedBuffer } from "./LinkedBuffer";
import { WriteSink, WriteSink_BUFFERED } from "./WriteSink";
import { types } from "./extension";
import i32 = types.i32;


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

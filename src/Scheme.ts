import { Input } from "./Input";
import { Output } from "./Output";

export interface Schema {
    writeTo(output: Output, message: any, polymorphic: boolean): void;

    mergeFrom(input: Input, message: any): any;
}
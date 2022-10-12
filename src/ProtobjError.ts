
export class ProtobjError extends Error {

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
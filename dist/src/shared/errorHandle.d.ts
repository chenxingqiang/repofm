export declare class repofmError extends Error {
    constructor(message: string);
}
export declare class repofmConfigValidationError extends repofmError {
    constructor(message: string);
}
export declare const handleError: (error: unknown) => void;
export declare const rethrowValidationErrorIfZodError: (error: unknown, message: string) => void;
//# sourceMappingURL=errorHandle.d.ts.map
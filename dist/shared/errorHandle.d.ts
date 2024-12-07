export declare class repofmError extends Error {
    constructor(message: string);
}
export declare class repofmConfigValidationError extends repofmError {
    constructor(message: string);
}
export declare function rethrowValidationErrorIfZodError(error: unknown, context: string): void;
export declare function handleError(error: unknown): void;

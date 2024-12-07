export interface ValidationError {
    message: string;
    code: string;
}
export declare function validateRequired(value: any, name: string): ValidationError | null;
export declare function validateEnum(value: string, allowedValues: string[], name: string): ValidationError | null;
export declare function validateTimeRange(value: string): ValidationError | null;
export declare function validateGitUrl(url: string): ValidationError | null;
export declare function validateFilePath(path: string): ValidationError | null;
export declare function validateOutputFormat(format: string): ValidationError | null;
export declare function validateContextType(type: string): ValidationError | null;
export declare function validateContextDepth(depth: string): ValidationError | null;
export declare function throwIfError(error: ValidationError | null): void;

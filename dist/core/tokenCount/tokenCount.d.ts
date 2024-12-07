import type { TokenCountOptions } from '../types.js';
declare class TokenCounter {
    private totalTokens;
    private encoding;
    private model;
    constructor(model?: string);
    addText(text: string): Promise<void>;
    addFile(path: string, content: string): Promise<void>;
    getTotal(): Promise<number>;
    reset(): Promise<void>;
    free(): void;
}
export { TokenCounter };
export declare const countTokens: (text: string | null | undefined, options?: TokenCountOptions) => Promise<number>;

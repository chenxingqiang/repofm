import type { TokenCountOptions } from '../../types/tokenCount.js';
export declare class TokenCounter {
    private encoding;
    constructor();
    countTokens(content: string | unknown, options?: TokenCountOptions): number;
    private fallbackTokenCount;
    free(): void;
}
//# sourceMappingURL=tokenCount.d.ts.map
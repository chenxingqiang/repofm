import type { Config } from '../../types/config.js';
export interface OutputGeneratorContext {
    config: Config;
    instruction: string;
    processedFiles: Array<{
        path: string;
        content: string;
    }>;
    directories: string[];
    rootDir: string;
}
//# sourceMappingURL=outputGeneratorTypes.d.ts.map
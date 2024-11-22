import type { Config } from '../../types/config.js';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
export declare const buildOutputGeneratorContext: (rootDir: string, config: Config, allPaths: string[], processedFiles?: Array<{
    path: string;
    content: string;
}>) => Promise<OutputGeneratorContext>;
export declare const generateOutput: (rootDir: string, config: Config, files: Array<{
    path: string;
    content: string;
}>, specialFiles?: string[]) => Promise<string>;
//# sourceMappingURL=outputGenerate.d.ts.map
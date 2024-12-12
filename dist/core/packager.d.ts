import type { Config } from '../config/configSchema.js';
import type { FileInfo, SuspiciousFileResult } from './types.js';
import { searchFiles } from './file/fileSearch.js';
import { collectFilesInfo } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { OutputGeneratorOptions } from './outputGenerator.js';
import { runSecurityCheck } from './security/securityCheck.js';
export interface GenerateOutputOptions extends OutputGeneratorOptions {
    data: any;
}
export declare function generateOutput(options: GenerateOutputOptions): string;
export interface Dependencies {
    searchFiles: typeof searchFiles;
    collectFiles: typeof collectFilesInfo;
    processFiles: typeof processFiles;
    runSecurityCheck: (files: FileInfo[]) => Promise<SuspiciousFileResult[]>;
    generateOutput: typeof generateOutput;
}
export interface PackResult {
    totalFiles: number;
    fileCharCounts: Record<string, number>;
    output: string;
}
export declare const defaultDeps: Dependencies;
export declare function pack(directory: string, config: Config & {
    cwd: string;
}, deps?: Dependencies): Promise<PackResult>;
export { processFiles, runSecurityCheck, };

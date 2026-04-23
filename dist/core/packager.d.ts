import type { Config } from '../types/config.js';
import type { FileInfo, SuspiciousFileResult } from './types.js';
import { findFiles } from './file/fileSearch.js';
import { collectFilesInfo } from './file/fileCollect.js';
import type { FileInfo as CollectFileInfo } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import type { ProcessedFile as FileProcessedFile } from './file/fileProcess.js';
import { OutputGeneratorOptions } from './outputGenerator.js';
import { runSecurityCheck } from './security/securityCheck.js';
export interface GenerateOutputOptions extends OutputGeneratorOptions {
    data: any;
}
export declare function generateOutput(options: GenerateOutputOptions): string;
export interface Dependencies {
    searchFiles: typeof findFiles;
    collectFiles: typeof collectFilesInfo;
    processFiles: (files: CollectFileInfo[]) => Promise<FileProcessedFile[]>;
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

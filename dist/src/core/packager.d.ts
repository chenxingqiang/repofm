import type { repofmConfigMerged } from '../config/configSchema.js';
import type { repofmProgressCallback } from '../shared/types.js';
import { collectFiles as defaultCollectFiles } from './file/fileCollect.js';
import { processFiles as defaultProcessFiles } from './file/fileProcess.js';
import { searchFiles as defaultSearchFiles } from './file/fileSearch.js';
import { generateOutput as defaultGenerateOutput } from './output/outputGenerate.js';
import { type SuspiciousFileResult, runSecurityCheck as defaultRunSecurityCheck } from './security/securityCheck.js';
export interface PackDependencies {
    searchFiles: typeof defaultSearchFiles;
    collectFiles: typeof defaultCollectFiles;
    processFiles: typeof defaultProcessFiles;
    runSecurityCheck: typeof defaultRunSecurityCheck;
    generateOutput: typeof defaultGenerateOutput;
}
export interface PackResult {
    totalFiles: number;
    totalCharacters: number;
    totalTokens: number;
    fileCharCounts: Record<string, number>;
    fileTokenCounts: Record<string, number>;
    suspiciousFilesResults: SuspiciousFileResult[];
}
export declare const pack: (rootDir: string, config: repofmConfigMerged, progressCallback?: repofmProgressCallback, deps?: PackDependencies) => Promise<PackResult>;
//# sourceMappingURL=packager.d.ts.map
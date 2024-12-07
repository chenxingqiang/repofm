import type { repofmConfigMerged } from '../config/configSchema.js';
import type { SuspiciousFileResult } from '../core/types.js';
export declare const printSummary: (totalFiles: number, totalCharacters: number, totalTokens: number, outputPath: string, suspiciousFilesResults: SuspiciousFileResult[], config: repofmConfigMerged) => void;
export declare const printSecurityCheck: (rootDir: string, suspiciousFilesResults: SuspiciousFileResult[], config: repofmConfigMerged) => void;
export declare const printTopFiles: (fileCharCounts: Record<string, number>, fileTokenCounts: Record<string, number>, topFilesLength: number) => void;
export declare const printCompletion: () => void;

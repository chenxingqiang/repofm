import type { FileInfo, SuspiciousFileResult } from '../types.js';
export type { SuspiciousFileResult };
export declare function runSecurityCheck(files: FileInfo[]): Promise<SuspiciousFileResult[]>;

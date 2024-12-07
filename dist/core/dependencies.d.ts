import type { FileInfo, SuspiciousFileResult } from './types.js';
import type { SearchConfig } from './file/fileSearch.js';
export interface GenerateOutputOptions {
    data: any;
    format?: 'json' | 'text' | 'markdown';
    pretty?: boolean;
}
export interface Dependencies {
    searchFiles: (rootDir: string, config?: Partial<SearchConfig>) => Promise<string[]>;
    collectFiles: (filePaths: string[], options?: {
        ignoreErrors?: boolean;
    }) => Promise<FileInfo[]>;
    processFiles: (collected: FileInfo[], config: any) => Promise<FileInfo[]>;
    generateOutput: (options: GenerateOutputOptions) => string;
    runSecurityCheck: (files: FileInfo[]) => Promise<SuspiciousFileResult[]>;
}
export declare const defaultDeps: Dependencies;

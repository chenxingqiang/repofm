import type { SearchOptions, SearchResult } from './file/fileSearch.js';
import type { FileInfo } from './file/fileCollect.js';
import type { SuspiciousFileResult } from './types.js';
export interface GenerateOutputOptions {
    data: any;
    format?: 'json' | 'text' | 'markdown';
    pretty?: boolean;
}
export interface Dependencies {
    searchFiles: (rootDir: string, pattern: string, options?: SearchOptions) => Promise<SearchResult[]>;
    collectFiles: (filePaths: string[]) => Promise<FileInfo[]>;
    processFiles: (collected: FileInfo[], config: any) => Promise<FileInfo[]>;
    generateOutput: (options: GenerateOutputOptions) => string;
    runSecurityCheck: (files: FileInfo[]) => Promise<SuspiciousFileResult[]>;
}
export declare const defaultDeps: Dependencies;

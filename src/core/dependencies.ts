import { searchFiles } from './file/fileSearch.js';
import type { SearchOptions, SearchResult } from './file/fileSearch.js';
import { collectFilesInfo } from './file/fileCollect.js';
import type { FileInfo } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { generateOutput } from './packager.js';
import { runSecurityCheck } from './security/securityCheck.js';
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

export const defaultDeps: Dependencies = {
  searchFiles,
  collectFiles: collectFilesInfo,
  processFiles: async (files, config) => {
    const processed = await processFiles(files, config);
    return processed.map(file => ({
      ...file,
      size: file.size || 0
    }));
  },
  generateOutput,
  runSecurityCheck
};
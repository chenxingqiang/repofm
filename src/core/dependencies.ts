import { searchFiles } from './file/fileSearch.js';
import { collectFiles } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { generateOutput } from './packager.js';
import { runSecurityCheck } from './security/securityCheck.js';
import type { FileInfo, SuspiciousFileResult } from './types.js';
import type { SearchConfig } from './file/fileSearch.js';

export interface GenerateOutputOptions {
  data: any;
  format?: 'json' | 'text' | 'markdown';
  pretty?: boolean;
}

export interface Dependencies {
  searchFiles: (rootDir: string, config?: Partial<SearchConfig>) => Promise<string[]>;
  collectFiles: (filePaths: string[], options?: { ignoreErrors?: boolean }) => Promise<FileInfo[]>;
  processFiles: (collected: FileInfo[], config: any) => Promise<FileInfo[]>;
  generateOutput: (options: GenerateOutputOptions) => string;
  runSecurityCheck: (files: FileInfo[]) => Promise<SuspiciousFileResult[]>;
}

export const defaultDeps: Dependencies = {
  searchFiles,
  collectFiles,
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
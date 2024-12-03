import { searchFiles } from './file/fileSearch';
import { collectFiles } from './file/fileCollect';
import { processFiles } from './file/fileProcess';
import type { Dependencies } from './types';

export function createDefaultDependencies(): Dependencies {
  return {
    searchFiles,
    collectFiles,
    processFiles,
  };
} 
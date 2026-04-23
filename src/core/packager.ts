import fs from 'node:fs/promises';
import path from 'path';
import { minimatch } from 'minimatch';
import type { Config } from '../types/config.js';
import type { ProcessedFile, FileInfo, SuspiciousFileResult } from './types.js';
import { findFiles } from './file/fileSearch.js';
import { collectFilesInfo } from './file/fileCollect.js';
import type { FileInfo as CollectFileInfo } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import type { ProcessedFile as FileProcessedFile } from './file/fileProcess.js';
import { OutputGenerator, OutputGeneratorOptions } from './outputGenerator.js';
import { runSecurityCheck } from './security/securityCheck.js';

export interface GenerateOutputOptions extends OutputGeneratorOptions {
  data: any;
}

export function generateOutput(options: GenerateOutputOptions): string {
  const { data, ...outputOptions } = options;
  const generator = new OutputGenerator(outputOptions);
  return generator.generate(data);
}

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

export const defaultDeps: Dependencies = {
  searchFiles: findFiles,
  collectFiles: collectFilesInfo,
  processFiles,
  runSecurityCheck,
  generateOutput,
};

export async function pack(
  directory: string,
  config: Config & { cwd: string },
  deps: Dependencies = defaultDeps
): Promise<PackResult> {
  try {
    const files = await deps.searchFiles(directory, ['**/*'], {
      ignore: {
        patterns: config.ignore.excludePatterns || [],
        useGitignore: config.ignore.useGitignore,
        useDefaultPatterns: config.ignore.useDefaultPatterns,
      }
    });
    const collected = await deps.collectFiles(files.map(f => path.join(directory, f)));
    const processed = await deps.processFiles(collected);

    // Optional security check
    const securityChecked = config.security.enableSecurityCheck 
      ? await deps.runSecurityCheck(processed.map(file => ({
          path: file.path,
          content: file.content,
          size: file.size || 0
        })))
      : processed;

    // Generate output  
    const output = deps.generateOutput({ 
      data: securityChecked, 
      format: config.output.style === 'plain' || config.output.style === 'xml' ? 'text' : 'markdown',
      pretty: true
    });

    return {
      totalFiles: securityChecked.length,
      fileCharCounts: securityChecked.reduce<Record<string, number>>((acc, file) => {
        if ('content' in file && 'path' in file) {
          acc[file.path] = file.content.length;
        }
        return acc;
      }, {}),
      output
    };
  } catch (error) {
    console.error('Error during file processing:', error);
    throw error;
  }
}

export {
  processFiles,
  runSecurityCheck,
};

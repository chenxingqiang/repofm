import fs from 'node:fs/promises';
import path from 'node:path';
import { minimatch } from 'minimatch';
import type { Config } from '../types/config.js';
import type { ProcessedFile, FileInfo, SuspiciousFileResult } from './types.js';
import { searchFiles } from './file/fileSearch.js';
import { collectFiles } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
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
  searchFiles: typeof searchFiles;
  collectFiles: typeof collectFiles;
  processFiles: typeof processFiles;
  runSecurityCheck: (files: FileInfo[]) => Promise<SuspiciousFileResult[]>;
  generateOutput: typeof generateOutput;
}

export interface PackResult {
  totalFiles: number;
  fileCharCounts: Record<string, number>;
  output: string;
}

export const defaultDeps: Dependencies = {
  searchFiles,
  collectFiles,
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
    const searchConfig = {
      patterns: config.ignore.excludePatterns,
      useGitignore: config.ignore.useGitignore,
      useDefaultPatterns: config.ignore.useDefaultPatterns
    };

    const files = await deps.searchFiles(directory, searchConfig);
    const collected = await deps.collectFiles(files, { ignoreErrors: true });
    const processed = await deps.processFiles(collected, config);

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

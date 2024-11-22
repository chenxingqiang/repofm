import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import clipboard from 'clipboardy';
import pMap from 'p-map';
import pc from 'picocolors';
import type { repofmConfigMerged } from '../config/configSchema.js';
import { logger } from '../shared/logger.js';
import { getProcessConcurrency } from '../shared/processConcurrency.js';
import type { repofmProgressCallback } from '../shared/types.js';
import { collectFiles as defaultCollectFiles } from './file/fileCollect.js';
import { processFiles as defaultProcessFiles } from './file/fileProcess.js';
import { searchFiles as defaultSearchFiles, type SearchConfig, type IgnoreConfig } from './file/fileSearch.js';
import { generateOutput as defaultGenerateOutput } from './output/outputGenerate.js';
import { type SuspiciousFileResult, runSecurityCheck as defaultRunSecurityCheck } from './security/securityCheck.js';
import { TokenCounter } from './tokenCount/tokenCount.js';
import { Config, normalizeIgnoreConfig } from '../types/config.js';

export interface PackDependencies {
  searchFiles: typeof defaultSearchFiles;
  collectFiles: typeof defaultCollectFiles;
  processFiles: typeof defaultProcessFiles;
  runSecurityCheck: typeof defaultRunSecurityCheck;
  generateOutput: typeof defaultGenerateOutput;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  countTokens: (content: string) => Promise<number>;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  totalTokens: number;
  fileCharCounts: Record<string, number>;
  fileTokenCounts: Record<string, number>;
  suspiciousFilesResults: SuspiciousFileResult[];
}

export async function pack(
  rootDir: string,
  config: repofmConfigMerged,
  progressCallback?: (message: string) => void,
  deps: PackDependencies = {
    searchFiles: defaultSearchFiles,
    collectFiles: defaultCollectFiles,
    processFiles: defaultProcessFiles,
    runSecurityCheck: defaultRunSecurityCheck,
    generateOutput: defaultGenerateOutput,
    readFile: async (path: string) => (await fs.readFile(path)).toString('utf-8'),
    writeFile: fs.writeFile,
    countTokens: async (content: string) => TokenCounter.count(content),
  },
): Promise<PackResult> {
  progressCallback?.('Starting file search...');

  // Normalize the root directory path
  const normalizedRootDir = path.resolve(rootDir);

  // Search for files
  progressCallback?.('Searching for files...');
  const filePaths = await deps.searchFiles(rootDir, {
    ...config,
    ignore: config.ignore || { useGitignore: true, useDefaultPatterns: true }
  });

  if (filePaths.length === 0) {
    return {
      totalFiles: 0,
      totalCharacters: 0,
      totalTokens: 0,
      fileCharCounts: {},
      fileTokenCounts: {},
      suspiciousFilesResults: []
    };
  }

  // Collect raw files
  progressCallback?.('Collecting files...');
  const rawFiles = await deps.collectFiles(filePaths, {
    ignoreErrors: false,
    rootDir: normalizedRootDir
  });

  let safeRawFiles = rawFiles;
  let suspiciousFilesResults: SuspiciousFileResult[] = [];

  if (config.security.enableSecurityCheck) {
    // Perform security check on all files at once
    progressCallback?.('Running security check...');
    suspiciousFilesResults = await deps.runSecurityCheck(rawFiles);
    safeRawFiles = rawFiles.filter(
      (rawFile) => !suspiciousFilesResults.some((result) => result.filePath === rawFile.path),
    );
  }

  const safeFilePaths = safeRawFiles.map((file) => file.path);
  logger.trace(`Safe files count: ${safeRawFiles.length}`);

  // Process files
  progressCallback?.('Processing files...');
  const processedFiles = await deps.processFiles(safeRawFiles, config);

  // Generate output
  progressCallback?.('Generating output...');
  const outputConfig: Config = {
    ...config,
    ignore: normalizeIgnoreConfig(config.ignore),
    cwd: config.cwd || process.cwd(),
  };
  const output = await deps.generateOutput(
    normalizedRootDir,
    outputConfig,
    processedFiles,
    safeFilePaths
  );

  // Write output
  progressCallback?.('Writing output file...');
  const outputPath = path.resolve(config.cwd || process.cwd(), config.output.filePath);
  logger.trace(`Writing output to: ${outputPath}`);
  await fs.writeFile(outputPath, output);

  if (config.output.copyToClipboard) {
    // Additionally copy to clipboard if flag is raised
    progressCallback?.('Copying to clipboard...');
    logger.trace('Copying output to clipboard');
    await clipboard.write(output);
  }

  // Calculate statistics
  const fileCharCounts: Record<string, number> = {};
  const fileTokenCounts: Record<string, number> = {};
  let totalCharacters = 0;
  let totalTokens = 0;

  for (const file of processedFiles) {
    fileCharCounts[file.path] = file.content.length;
    fileTokenCounts[file.path] = await deps.countTokens(file.content);
    totalCharacters += fileCharCounts[file.path];
    totalTokens += fileTokenCounts[file.path];
  }

  return {
    totalFiles: processedFiles.length,
    totalCharacters,
    totalTokens,
    fileCharCounts,
    fileTokenCounts,
    suspiciousFilesResults
  };
}

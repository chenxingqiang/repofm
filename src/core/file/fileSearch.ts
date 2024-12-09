import fs from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';
import type { Options as GlobbyOptions } from 'globby';
import { logger } from '../../shared/logger.js';
import { exists, isDirectory } from './fileUtils.js';

export interface SearchOptions {
  dot?: boolean;
  followSymlinks?: boolean;
  ignore?: string[] | {
    patterns: string[];
    useGitignore: boolean;
    useDefaultPatterns: boolean;
  };
}

export interface SearchResult {
  path: string;
  matches?: {
    line: number;
    content: string;
  }[];
}

export async function searchFiles(
  searchPath: string,
  pattern: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    if (!(await exists(searchPath))) {
      throw new Error(`Search path does not exist: ${searchPath}`);
    }

    if (!(await isDirectory(searchPath))) {
      throw new Error(`Search path is not a directory: ${searchPath}`);
    }

    const globbyOptions: GlobbyOptions = {
      cwd: searchPath,
      dot: options.dot,
      followSymbolicLinks: options.followSymlinks,
      gitignore: typeof options.ignore === 'object' ? options.ignore.useGitignore : true,
      ignore: Array.isArray(options.ignore)
        ? options.ignore
        : options.ignore?.patterns || [],
      absolute: true,
      onlyFiles: true,
    };

    const files = await globby(pattern, globbyOptions);

    const results: SearchResult[] = [];

    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        if (!stats.isFile()) continue;

        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        const matches = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const matchPattern = pattern;
          const searchLine = line;

          if (searchLine.includes(matchPattern)) {
            matches.push({
              line: i + 1,
              content: line.trim()
            });
          }
        }

        if (matches.length > 0) {
          results.push({
            path: path.relative(searchPath, file),
            matches
          });
        }
      } catch (error) {
        logger.error(`Error processing file ${file}:`, error);
      }
    }

    return results;
  } catch (error) {
    logger.error(`Error searching files in ${searchPath}:`, error);
    throw error;
  }
}

export async function findFiles(
  searchPath: string,
  patterns: string[],
  options: SearchOptions = {}
): Promise<string[]> {
  try {
    if (!(await exists(searchPath))) {
      throw new Error(`Search path does not exist: ${searchPath}`);
    }

    const globbyOptions: GlobbyOptions = {
      cwd: searchPath,
      dot: options.dot,
      followSymbolicLinks: options.followSymlinks,
      gitignore: typeof options.ignore === 'object' ? options.ignore.useGitignore : true,
      ignore: Array.isArray(options.ignore)
        ? options.ignore
        : options.ignore?.patterns || [],
      absolute: true,
      onlyFiles: true,
    };

    const files = await globby(patterns, globbyOptions);

    return files.map(file => path.relative(searchPath, file));
  } catch (error) {
    logger.error(`Error finding files in ${searchPath}:`, error);
    throw error;
  }
}

export function matchPattern(filePath: string, pattern: string, caseSensitive = true): boolean {
  try {
    const options = { nocase: !caseSensitive };
    return minimatch(filePath, pattern, options);
  } catch (error) {
    logger.error(`Error matching pattern ${pattern} against ${filePath}:`, error);
    throw error;
  }
}

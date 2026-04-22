import path from 'node:path';
import * as fs from 'node:fs/promises';
import { findFiles as globFindFiles, type SearchOptions } from './fileSearch.js';

export interface FindConfig {
  pattern: string;
  type: 'file' | 'directory' | 'both';
  maxDepth: number;
  ignoreCase: boolean;
  excludePatterns: string[];
  followSymlinks: boolean;
}

export async function findFiles(rootDir: string, config: FindConfig): Promise<string[]> {
  const { pattern, type, maxDepth, ignoreCase, excludePatterns, followSymlinks } = config;

  // Convert find pattern to glob pattern
  let globPattern = pattern === '*' ? '**/*' : `**/${pattern}`;

  // Apply case-insensitive matching by expanding characters
  if (ignoreCase) {
    globPattern = globPattern.replace(/[a-zA-Z]/g, c =>
      `[${c.toLowerCase()}${c.toUpperCase()}]`
    );
  }

  const searchOptions: SearchOptions = {
    dot: true,
    followSymlinks,
    ignore: { patterns: excludePatterns, useGitignore: true, useDefaultPatterns: true },
  };

  const files = await globFindFiles(rootDir, [globPattern], searchOptions);

  // Filter by type if needed
  if (type !== 'both') {
    const filtered: string[] = [];
    for (const file of files) {
      const fullPath = path.join(rootDir, file);
      try {
        const stat = await fs.stat(fullPath);
        if (type === 'file' ? stat.isFile() : stat.isDirectory()) {
          filtered.push(file);
        }
      } catch {
        // Skip files that can't be stat-ed
      }
    }
    return filtered;
  }

  return files;
}

import path from 'node:path';
import * as fs from 'node:fs/promises';
import { searchFiles, type SearchConfig } from './fileSearch.js';

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
  const globPattern = pattern.replace(/\*\*/g, '**/*');
  const depthPattern = maxDepth > 0 ? `{${Array(maxDepth).fill('*').join('/')}}` : '**';
  const patterns = [`${depthPattern}/${globPattern}`];

  // Create search config
  const searchConfig: SearchConfig = {
    patterns,
    ignore: {
      patterns: excludePatterns,
      useGitignore: true,
      useDefaultPatterns: true,
      customPatterns: [],
    },
    dot: true,
    followSymlinks,
  };

  // Add case sensitivity
  if (ignoreCase) {
    searchConfig.patterns = patterns.map(p => 
      p.replace(/[a-zA-Z]/g, c => `[${c.toLowerCase()}${c.toUpperCase()}]`)
    );
  }

  // Search for files
  const results = await searchFiles(rootDir, searchConfig);

  // Filter by type if needed
  if (type !== 'both') {
    return results.filter(async file => {
      const fullPath = path.join(rootDir, file);
      const stat = await fs.stat(fullPath);
      return type === 'file' ? stat.isFile() : stat.isDirectory();
    });
  }

  return results;
}

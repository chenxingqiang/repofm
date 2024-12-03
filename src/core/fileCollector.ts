import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { CollectedFile } from './types.js';

export async function collectFiles(files: string[], directory: string): Promise<CollectedFile[]> {
  const results: CollectedFile[] = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const stats = await fs.stat(file);
      const relativePath = path.relative(directory, file);

      results.push({
        path: relativePath,
        content,
        size: stats.size,
      });
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return results;
}

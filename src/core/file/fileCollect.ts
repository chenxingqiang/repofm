import { logger } from '../../shared/logger.js';
import * as fs from 'fs/promises';

export async function collectFiles(
  filePaths: string[],
  options: { ignoreErrors?: boolean } = {}
) {
  const results = [];

  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      
      // Check if file is binary
      if (isBinaryContent(content)) {
        logger.debug('Skipping binary file', filePath);
        continue;
      }

      results.push({
        path: filePath,
        content: content.toString(),
        size: stats.size
      });
    } catch (error) {
      logger.error('Error reading file', filePath);
      
      if (!options.ignoreErrors) {
        throw error;
      }
    }
  }

  return results;
}

function isBinaryContent(buffer: Buffer): boolean {
  // Simple binary check - looks for null bytes in first 1024 bytes
  const sampleSize = Math.min(1024, buffer.length);
  for (let i = 0; i < sampleSize; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../../shared/logger.js';

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  lastModified: Date;
}

export interface CollectOptions {
  ignoreErrors?: boolean;
}

export interface CollectedFile {
  path: string;
  content: string;
  size: number;
}

function isBinaryContent(buffer: Buffer): boolean {
  for (let i = 0; i < Math.min(buffer.length, 8192); i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

export async function collectFiles(
  filePaths: string[],
  options: CollectOptions = {}
): Promise<CollectedFile[]> {
  const results: CollectedFile[] = [];

  for (const filePath of filePaths) {
    try {
      const buffer = await fs.readFile(filePath);
      if (isBinaryContent(buffer)) {
        logger.debug(`Skipping binary file`, filePath);
        continue;
      }
      const stats = await fs.stat(filePath);
      results.push({
        path: filePath,
        content: buffer.toString('utf8'),
        size: stats.size
      });
    } catch (error) {
      if (options.ignoreErrors) {
        logger.error(`Error reading file ${filePath}:`, String(error));
      } else {
        throw error;
      }
    }
  }

  return results;
}

export async function collectFileInfo(filePath: string): Promise<FileInfo> {
  try {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf8');
    
    return {
      path: filePath,
      content,
      size: stats.size,
      lastModified: stats.mtime
    };
  } catch (error) {
    logger.error(`Error collecting file info for ${filePath}:`, error);
    throw error;
  }
}

export async function collectFilesInfo(filePaths: string[]): Promise<FileInfo[]> {
  const results: FileInfo[] = [];
  
  for (const filePath of filePaths) {
    try {
      const fileInfo = await collectFileInfo(filePath);
      results.push(fileInfo);
    } catch (error) {
      logger.warn(`Skipping file ${filePath} due to error:`, error);
    }
  }
  
  return results;
}

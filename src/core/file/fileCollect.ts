import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../../shared/logger.js';

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  lastModified: Date;
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

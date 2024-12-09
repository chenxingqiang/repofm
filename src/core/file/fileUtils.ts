import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../../shared/logger.js';

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch (error) {
    logger.error(`Error checking if path is directory: ${filePath}`, error);
    throw error;
  }
}

export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    logger.error(`Error checking if path is file: ${filePath}`, error);
    throw error;
  }
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error(`Error creating directory: ${dirPath}`, error);
    throw error;
  }
}

export function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, '/');
}

export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}

export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error(`Error getting file size: ${filePath}`, error);
    throw error;
  }
}

export async function getModifiedTime(filePath: string): Promise<Date> {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime;
  } catch (error) {
    logger.error(`Error getting modified time: ${filePath}`, error);
    throw error;
  }
}

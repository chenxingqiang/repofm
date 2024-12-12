import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../../shared/logger.js';
export async function isDirectory(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.isDirectory();
    }
    catch (error) {
        logger.error(`Error checking if path is directory: ${filePath}`, error);
        throw error;
    }
}
export async function isFile(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.isFile();
    }
    catch (error) {
        logger.error(`Error checking if path is file: ${filePath}`, error);
        throw error;
    }
}
export async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
export async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        logger.error(`Error creating directory: ${dirPath}`, error);
        throw error;
    }
}
export function normalizePath(filePath) {
    return path.normalize(filePath).replace(/\\/g, '/');
}
export function getRelativePath(from, to) {
    return path.relative(from, to);
}
export function joinPaths(...paths) {
    return path.join(...paths);
}
export async function getFileSize(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.size;
    }
    catch (error) {
        logger.error(`Error getting file size: ${filePath}`, error);
        throw error;
    }
}
export async function getModifiedTime(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.mtime;
    }
    catch (error) {
        logger.error(`Error getting modified time: ${filePath}`, error);
        throw error;
    }
}
//# sourceMappingURL=fileUtils.js.map
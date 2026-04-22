import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import {
  isDirectory,
  isFile,
  exists,
  ensureDir,
  normalizePath,
  getRelativePath,
  joinPaths,
  getFileSize,
  getModifiedTime,
} from '../../../src/core/file/fileUtils.js';

vi.mock('node:fs/promises');

const mockStat = vi.mocked(fs.stat);
const mockAccess = vi.mocked(fs.access);
const mockMkdir = vi.mocked(fs.mkdir);

describe('fileUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('isDirectory', () => {
    it('should return true when path is a directory', async () => {
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        isFile: () => false,
      } as any);
      const result = await isDirectory('/some/dir');
      expect(result).toBe(true);
    });

    it('should return false when path is not a directory', async () => {
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      const result = await isDirectory('/some/file.txt');
      expect(result).toBe(false);
    });

    it('should throw when stat fails', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT: no such file or directory'));
      await expect(isDirectory('/nonexistent')).rejects.toThrow('ENOENT');
    });
  });

  describe('isFile', () => {
    it('should return true when path is a file', async () => {
      mockStat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      const result = await isFile('/some/file.txt');
      expect(result).toBe(true);
    });

    it('should return false when path is a directory', async () => {
      mockStat.mockResolvedValue({
        isDirectory: () => true,
        isFile: () => false,
      } as any);
      const result = await isFile('/some/dir');
      expect(result).toBe(false);
    });

    it('should throw when stat fails', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      await expect(isFile('/nonexistent')).rejects.toThrow('ENOENT');
    });
  });

  describe('exists', () => {
    it('should return true when path is accessible', async () => {
      mockAccess.mockResolvedValue(undefined);
      const result = await exists('/some/path');
      expect(result).toBe(true);
    });

    it('should return false when path is not accessible', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      const result = await exists('/nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('should call mkdir with recursive option', async () => {
      mockMkdir.mockResolvedValue(undefined);
      await ensureDir('/some/deep/dir');
      expect(mockMkdir).toHaveBeenCalledWith('/some/deep/dir', { recursive: true });
    });

    it('should throw when mkdir fails', async () => {
      mockMkdir.mockRejectedValue(new Error('EACCES: permission denied'));
      await expect(ensureDir('/protected/dir')).rejects.toThrow('EACCES');
    });
  });

  describe('normalizePath', () => {
    it('should normalize path separators to forward slashes', () => {
      const result = normalizePath('src\\utils\\helper.ts');
      expect(result).not.toContain('\\');
    });

    it('should normalize redundant separators', () => {
      const result = normalizePath('src//utils/helper.ts');
      expect(result).not.toContain('//');
    });

    it('should normalize . references', () => {
      const result = normalizePath('src/./utils/helper.ts');
      expect(result).toBe('src/utils/helper.ts');
    });

    it('should return forward-slash path as-is', () => {
      const result = normalizePath('src/utils/helper.ts');
      expect(result).toBe('src/utils/helper.ts');
    });

    it('should handle empty string', () => {
      const result = normalizePath('');
      expect(typeof result).toBe('string');
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path from one directory to another', () => {
      const result = getRelativePath('/home/user/project', '/home/user/project/src/index.ts');
      expect(result).toBe('src/index.ts');
    });

    it('should return ../ for parent directory', () => {
      const result = getRelativePath('/home/user/project/src', '/home/user/project/tests');
      expect(result).toContain('..');
    });

    it('should return empty string when paths are the same', () => {
      const result = getRelativePath('/home/user/project', '/home/user/project');
      expect(result).toBe('');
    });
  });

  describe('joinPaths', () => {
    it('should join path segments', () => {
      const result = joinPaths('/home', 'user', 'project');
      expect(result).toContain('home');
      expect(result).toContain('user');
      expect(result).toContain('project');
    });

    it('should handle single segment', () => {
      const result = joinPaths('/home/user');
      expect(result).toBe('/home/user');
    });

    it('should handle relative paths', () => {
      const result = joinPaths('src', 'utils', 'helper.ts');
      expect(result).toBe('src/utils/helper.ts');
    });
  });

  describe('getFileSize', () => {
    it('should return file size from stat', async () => {
      mockStat.mockResolvedValue({
        size: 1024,
        isFile: () => true,
        isDirectory: () => false,
        mtime: new Date(),
      } as any);
      const result = await getFileSize('/some/file.txt');
      expect(result).toBe(1024);
    });

    it('should throw when stat fails', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      await expect(getFileSize('/nonexistent')).rejects.toThrow('ENOENT');
    });

    it('should return 0 for empty file', async () => {
      mockStat.mockResolvedValue({
        size: 0,
        isFile: () => true,
        isDirectory: () => false,
        mtime: new Date(),
      } as any);
      const result = await getFileSize('/empty-file.txt');
      expect(result).toBe(0);
    });
  });

  describe('getModifiedTime', () => {
    it('should return mtime from stat', async () => {
      const mtime = new Date('2024-01-15T12:00:00Z');
      mockStat.mockResolvedValue({
        mtime,
        size: 100,
        isFile: () => true,
        isDirectory: () => false,
      } as any);
      const result = await getModifiedTime('/some/file.txt');
      expect(result).toEqual(mtime);
    });

    it('should throw when stat fails', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      await expect(getModifiedTime('/nonexistent')).rejects.toThrow('ENOENT');
    });
  });
});

// tests/core/file/permissionCheck.test.ts

import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionError, checkDirectoryPermissions } from '../../../src/core/file/permissionCheck.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('node:fs/promises');
vi.mock('node:os');
vi.mock('../../../src/shared/logger');

describe('permissionCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic Permission Checks', () => {
    it('should return true for directory with all permissions', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(true);
      expect(result.details).toEqual({
        read: true,
        write: true,
        execute: true,
      });
    });

    it('should handle missing permissions', async () => {
      // Mock access to fail for write permission
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // Read OK
        .mockRejectedValueOnce(new Error('EACCES')) // Write Failed
        .mockResolvedValueOnce(undefined); // Execute OK

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.details).toEqual({
        read: true,
        write: false,
        execute: true,
      });
    });

    it('should handle completely inaccessible directory', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('EACCES: permission denied'));
      vi.mocked(fs.readdir).mockRejectedValue(new Error('EACCES: permission denied'));

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(false);
      expect(result.error).toBeInstanceOf(PermissionError);
      expect(result.details).toEqual({
        read: false,
        write: false,
        execute: false,
      });
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle Windows permissions', async () => {
      vi.mocked(os.platform).mockReturnValue('win32');
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const result = await checkDirectoryPermissions('C:\\test\\dir');

      expect(result.hasPermission).toBe(true);
      expect(result.details).toBeDefined();
    });

    it('should handle macOS permissions', async () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(true);
      expect(result.details).toBeDefined();
    });

    it('should handle Linux permissions', async () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(true);
      expect(result.details).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle ENOENT error', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await checkDirectoryPermissions('/nonexistent/dir');

      expect(result.hasPermission).toBe(false);
      expect(result.error?.message).toContain('no such file or directory');
    });

    it('should handle EPERM error', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('EPERM: operation not permitted'));

      const result = await checkDirectoryPermissions('/protected/dir');

      expect(result.hasPermission).toBe(false);
      expect(result.error).toBeInstanceOf(PermissionError);
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('Unexpected error'));

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(false);
      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe('Directory Content Access', () => {
    it('should check subdirectory permissions', async () => {
      const mockFiles = ['file1', 'file2', 'subdir'];
      const mockStats = { isDirectory: () => false };

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(true);
      expect(fs.readdir).toHaveBeenCalled();
    });

    it('should handle partial access to subdirectories', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['accessible', 'inaccessible'] as any);
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // Root directory
        .mockResolvedValueOnce(undefined) // Accessible directory
        .mockRejectedValueOnce(new Error('EACCES')); // Inaccessible directory

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.hasPermission).toBe(true);
      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe('Symbolic Links', () => {
    it('should handle symbolic links', async () => {
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => true,
      } as any);
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions('/test/link');

      expect(result.hasPermission).toBe(true);
    });

    it('should handle broken symbolic links', async () => {
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isSymbolicLink: () => true,
      } as any);
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await checkDirectoryPermissions('/test/broken-link');

      expect(result.hasPermission).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Special Cases', () => {
    it('should handle root directory', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions('/');

      expect(result.hasPermission).toBe(true);
    });

    it('should handle home directory', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      const result = await checkDirectoryPermissions('~/test');

      expect(result.hasPermission).toBe(true);
    });

    it('should handle relative paths', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions('./test');

      expect(result.hasPermission).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(
        expect.stringContaining('test'),
        expect.any(Number)
      );
    });

    it('should handle network paths', async () => {
      const networkPath = process.platform === 'win32'
        ? '\\\\server\\share'
        : '/mnt/network';

      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions(networkPath);

      expect(result.hasPermission).toBe(true);
    });

    it('should handle paths with spaces', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await checkDirectoryPermissions('/path with spaces/test');

      expect(result.hasPermission).toBe(true);
    });
  });

  describe('Permission Error Details', () => {
    it('should provide detailed error messages for macOS', async () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      vi.mocked(fs.access).mockRejectedValue(new Error('EACCES'));

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.error).toBeInstanceOf(PermissionError);
      expect(result.error?.message).toContain('System Settings');
      expect(result.error?.message).toContain('Privacy & Security');
    });

    it('should provide basic error messages for non-macOS platforms', async () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(fs.access).mockRejectedValue(new Error('EACCES'));

      const result = await checkDirectoryPermissions('/test/dir');

      expect(result.error).toBeInstanceOf(PermissionError);
      expect(result.error?.message).not.toContain('System Settings');
    });

    it('should include path information in error messages', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('EACCES'));

      const testPath = '/test/dir';
      const result = await checkDirectoryPermissions(testPath);

      expect(result.error?.message).toContain(testPath);
    });
  });

  describe('Performance', () => {
    it('should handle directories with many files efficiently', async () => {
      const manyFiles = Array.from({ length: 10000 }, (_, i) => `file${i}`);
      vi.mocked(fs.readdir).mockResolvedValue(manyFiles as any);
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => false } as any);

      const startTime = Date.now();
      await checkDirectoryPermissions('/test/dir');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle deeply nested directories efficiently', async () => {
      const deepPath = path.join(...Array(50).fill('subdir')); // Very deep path
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const startTime = Date.now();
      await checkDirectoryPermissions(deepPath);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

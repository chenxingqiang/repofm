import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as url from 'node:url';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getVersion } from '../../../src/core/file/packageJsonParse.js';
import { logger } from '../../../src/shared/logger.js';
// tests/core/file/packageJsonParse.test.ts
vi.mock('fs/promises');
vi.mock('url');

describe('packageJsonParse', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getVersion should return correct version from package.json', async () => {
    const mockPackageJson = {
      name: 'repofm',
      version: '1.2.3',
    };

    vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path/to/src/core/file');
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

    const version = await getVersion();

    expect(version).toBe('1.2.3');
    expect(url.fileURLToPath).toHaveBeenCalledWith(expect.any(URL));
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join('/mock/path/to/src/core/file', '..', '..', '..', 'package.json'),
      'utf-8',
    );
  });

  test('getVersion should handle missing version in package.json', async () => {
    const mockPackageJson = {
      name: 'repofm',
    };

    const loggerSpy = vi.spyOn(logger, 'warn').mockImplementation(vi.fn());

    vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path/to/src/core/file2');
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

    const version = await getVersion();

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('No version found in package.json'));

    expect(version).toBe('unknown');
  });
});





vi.mock('node:fs/promises');
vi.mock('node:url');
vi.mock('../../../src/shared/logger');

describe('packageJsonParse', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getVersion', () => {
    test('should return correct version from package.json', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3',
      };

      // Mock fileURLToPath to return a predictable path
      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path/to/src/core/file');
      // Mock readFile to return our mock package.json content
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const version = await getVersion();

      expect(version).toBe('1.2.3');
      expect(url.fileURLToPath).toHaveBeenCalledWith(expect.any(URL));
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        'utf-8'
      );
    });

    test('should handle missing version in package.json', async () => {
      const mockPackageJson = {
        name: 'repofm',
        // version field omitted
      };

      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const version = await getVersion();

      expect(version).toBe('unknown');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No version found in package.json')
      );
    });

    test('should handle file read errors', async () => {
      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const version = await getVersion();

      expect(version).toBe('unknown');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error reading package.json'),
        expect.any(Error)
      );
    });

    test('should handle invalid JSON in package.json', async () => {
      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue('invalid json content');

      const version = await getVersion();

      expect(version).toBe('unknown');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle version with pre-release tags', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3-beta.1',
      };

      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const version = await getVersion();

      expect(version).toBe('1.2.3-beta.1');
    });

    test('should handle version with build metadata', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3+build.123',
      };

      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const version = await getVersion();

      expect(version).toBe('1.2.3+build.123');
    });
  });

  describe('Error Handling', () => {
    test('should handle file system permission errors', async () => {
      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockRejectedValue(new Error('EACCES: permission denied'));

      const version = await getVersion();

      expect(version).toBe('unknown');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error reading package.json'),
        expect.any(Error)
      );
    });

    test('should handle non-existent package.json', async () => {
      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const version = await getVersion();

      expect(version).toBe('unknown');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle unexpected JSON structure', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: { // Version as an object instead of string
          major: 1,
          minor: 2,
          patch: 3
        }
      };

      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const version = await getVersion();

      expect(version).toBe('unknown');
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('Path Resolution', () => {
    test('should handle different file URL formats', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      // Test with different URL formats
      const urlFormats = [
        'file:///mock/path',
        'file://localhost/mock/path',
        'file://./mock/path',
      ];

      for (const urlFormat of urlFormats) {
        vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
        const version = await getVersion();
        expect(version).toBe('1.2.3');
      }
    });

    test('should handle paths with spaces and special characters', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      // Test with path containing spaces and special characters
      vi.mocked(url.fileURLToPath).mockReturnValue('/mock path/with spaces/and#special@chars');

      const version = await getVersion();
      expect(version).toBe('1.2.3');
    });
  });

  describe('Version Format Validation', () => {
    test('should handle malformed version strings', async () => {
      const testCases = [
        { version: 'not.a.version', expected: 'unknown' },
        { version: '1.2', expected: '1.2' },
        { version: '1', expected: '1' },
        { version: 'v1.2.3', expected: 'v1.2.3' },
        { version: '', expected: 'unknown' },
        { version: '  ', expected: 'unknown' },
        { version: '1.2.3.4', expected: '1.2.3.4' },
      ];

      for (const { version, expected } of testCases) {
        const mockPackageJson = {
          name: 'repofm',
          version,
        };

        vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

        const result = await getVersion();
        expect(result).toBe(expected);
      }
    });

    test('should handle version with invalid characters', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3$invalid',
      };

      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const version = await getVersion();
      expect(version).toBe('1.2.3$invalid');
    });
  });

  describe('Performance', () => {
    test('should cache version value for subsequent calls', async () => {
      const mockPackageJson = {
        name: 'repofm',
        version: '1.2.3',
      };

      vi.mocked(url.fileURLToPath).mockReturnValue('/mock/path');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      // First call
      const version1 = await getVersion();
      expect(version1).toBe('1.2.3');

      // Second call should use cached value
      const version2 = await getVersion();
      expect(version2).toBe('1.2.3');

      // fs.readFile should only be called once
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });
  });
});

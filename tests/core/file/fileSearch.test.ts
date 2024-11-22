import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { searchFiles, SearchConfig } from '../../../src/core/file/fileSearch.js';
import { logger } from '../../../src/shared/logger.js';
import { globby } from 'globby';

vi.mock('globby', () => ({
  globby: vi.fn(),
}));

vi.mock('../../../src/shared/logger.js');

describe('fileSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('basic functionality', () => {
    test('finds all files with default config', async () => {
      const mockFiles = ['file1.txt', 'file2.txt', 'file3.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const result = await searchFiles('/test/dir');
      expect(result).toEqual(mockFiles);
    });

    test('returns empty array for directory with no files', async () => {
      vi.mocked(globby).mockResolvedValueOnce([]);

      const result = await searchFiles('/test/dir');
      expect(result).toHaveLength(0);
    });

    test('returns relative paths', async () => {
      vi.mocked(globby).mockResolvedValueOnce(['subdir/file.txt']);

      const result = await searchFiles('/test/dir');
      expect(result).toEqual(['subdir/file.txt']);
    });
  });

  describe('search patterns', () => {
    test('finds files matching single pattern', async () => {
      const mockFiles = ['file1.txt', 'subdir/file3.txt', 'subdir/nested/file5.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        patterns: ['**/*.txt'],
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });

    test('finds files matching multiple patterns', async () => {
      const mockFiles = ['file1.txt', 'file2.js', 'subdir/file3.txt', 'subdir/nested/file5.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        patterns: ['**/*.txt', '**/file2.js'],
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });

    test('supports negation patterns', async () => {
      const mockFiles = ['file1.txt', 'subdir/file3.txt', 'subdir/nested/file5.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        patterns: ['**/*', '!**/*.js'],
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });
  });

  describe('ignore configuration', () => {
    test('uses default ignore patterns', async () => {
      const mockFiles = ['file1.txt', 'file1.js', 'build/file3.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const result = await searchFiles('/test/dir');
      expect(result).toEqual(mockFiles);
      expect(result).not.toContain('node_modules/file4.txt');
      expect(result).not.toContain('.git/file5.txt');
    });

    test('respects custom ignore patterns', async () => {
      const mockFiles = ['file1.txt', 'build/file3.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        ignore: {
          patterns: ['**/test/**', '**/*.js'],
          useDefaultPatterns: false,
        },
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });

    test('combines default and custom patterns', async () => {
      const mockFiles = ['file1.txt', 'file1.js'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        ignore: {
          patterns: ['**/test/**'],
          useDefaultPatterns: true,
        },
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });
  });

  describe('dot files', () => {
    test('ignores dot files by default', async () => {
      const mockFiles = ['visible1'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const result = await searchFiles('/test/dir');
      expect(result).toEqual(mockFiles);
    });

    test('includes dot files when configured', async () => {
      const mockFiles = ['.hidden1', '.config/hidden2', 'visible1', '.gitignore'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        dot: true,
        ignore: {
          useDefaultPatterns: false,
        },
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });
  });

  describe('symbolic links', () => {
    test('does not follow symlinks by default', async () => {
      const mockFiles = ['real/file.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const result = await searchFiles('/test/dir');
      expect(result).toEqual(mockFiles);
    });

    test('follows symlinks when configured', async () => {
      const mockFiles = ['real/file.txt', 'link/file.txt'];
      vi.mocked(globby).mockResolvedValueOnce(mockFiles);

      const config: Partial<SearchConfig> = {
        followSymlinks: true,
      };

      const result = await searchFiles('/test/dir', config);
      expect(result).toEqual(mockFiles);
    });
  });

  describe('error handling', () => {
    test('throws error for non-existent directory', async () => {
      vi.mocked(globby).mockRejectedValueOnce(new Error('ENOENT'));

      await expect(searchFiles('/non-existent')).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });

    test('throws error for file path instead of directory', async () => {
      vi.mocked(globby).mockRejectedValueOnce(new Error('ENOTDIR'));

      await expect(searchFiles('/test/file.txt')).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('globby options', () => {
    test('passes correct options to globby', async () => {
      const config: Partial<SearchConfig> = {
        patterns: ['**/*.txt'],
        ignore: {
          patterns: ['**/test/**'],
          useGitignore: true,
          useDefaultPatterns: true,
        },
        dot: true,
        followSymlinks: true,
      };

      vi.mocked(globby).mockResolvedValueOnce([]);
      await searchFiles('/test/dir', config);

      expect(globby).toHaveBeenCalledWith(
        ['**/*.txt'],
        expect.objectContaining({
          cwd: '/test/dir',
          absolute: false,
          dot: true,
          followSymbolicLinks: true,
          ignore: ['**/test/**'],
          gitignore: true,
          onlyFiles: true,
        })
      );
    });
  });
});

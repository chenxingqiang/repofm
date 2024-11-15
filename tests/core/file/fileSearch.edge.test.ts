



// tests/core/file/fileSearch.edge.test.ts

import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchFiles } from '../../../src/core/file/fileSearch';
import { logger } from '../../../src/shared/logger';
import { createMockConfig } from '../../testing/testUtils';

vi.mock('fs/promises');
vi.mock('globby');
vi.mock('../../../src/shared/logger');

describe('fileSearch - Edge Cases', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Special Characters and Encodings', () => {
    it('should handle paths with special characters', async () => {
      const mockConfig = createMockConfig();
      const specialChars = [
        'file with spaces.js',
        'file#with#hash.js',
        'file@with@at.js',
        'file(with)parentheses.js',
        'file[with]brackets.js',
        'file{with}braces.js',
        'file+with+plus.js',
        'file=with=equals.js',
        'file^with^caret.js',
        'file$with$dollar.js',
      ];

      vi.mocked(globby).mockResolvedValue(specialChars);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toEqual(specialChars.sort());
    });

    it('should handle paths with unicode characters', async () => {
      const mockConfig = createMockConfig();
      const unicodePaths = [
        '文件.js',
        'ファイル.js',
        'файл.js',
        '파일.js',
        'ملف.js',
        'αρχείο.js',
      ];

      vi.mocked(globby).mockResolvedValue(unicodePaths);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toEqual(unicodePaths.sort());
    });

    it('should handle paths with emoji characters', async () => {
      const mockConfig = createMockConfig();
      const emojiPaths = [
        '📁folder/file.js',
        '⭐star.js',
        '🎉party.js',
        '💻code.js',
      ];

      vi.mocked(globby).mockResolvedValue(emojiPaths);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toEqual(emojiPaths.sort());
    });
  });

  describe('Path Length Edge Cases', () => {
    it('should handle very long file paths', async () => {
      const mockConfig = createMockConfig();
      const longPath = 'a'.repeat(255) + '.js'; // Maximum filename length in many filesystems

      vi.mocked(globby).mockResolvedValue([longPath]);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toContain(longPath);
    });

    it('should handle deeply nested paths', async () => {
      const mockConfig = createMockConfig();
      const parts = Array(50).fill('subdir'); // Very deep nesting
      const deepPath = path.join(...parts, 'file.js');

      vi.mocked(globby).mockResolvedValue([deepPath]);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toContain(deepPath);
    });
  });

  describe('Pattern Matching Edge Cases', () => {
    it('should handle complex glob patterns', async () => {
      const mockConfig = createMockConfig({
        include: [
          '**/*.{js,jsx,ts,tsx}',
          '!**/__tests__/**',
          '!**/*.test.*',
          '!**/*.spec.*',
          '**/index.*',
        ],
      });

      const files = [
        'src/index.js',
        'src/file.js',
        'src/file.test.js',
        'src/__tests__/file.js',
        'src/file.spec.js',
        'src/components/index.tsx',
      ];

      vi.mocked(globby).mockResolvedValue(['src/index.js', 'src/components/index.tsx']);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toEqual(['src/components/index.tsx', 'src/index.js']);
    });

    it('should handle overlapping include/ignore patterns', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*.js', '!**/*.min.js', '**/*.min.js'],
        ignore: {
          customPatterns: ['vendor/*.min.js', '!vendor/important.min.js'],
        },
      });

      const files = [
        'file.js',
        'file.min.js',
        'vendor/lib.min.js',
        'vendor/important.min.js',
      ];

      vi.mocked(globby).mockResolvedValue([
        'file.js',
        'file.min.js',
        'vendor/important.min.js',
      ]);

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toContain('vendor/important.min.js');
      expect(result).not.toContain('vendor/lib.min.js');
    });
  });

  describe('System and Hidden Files', () => {
    it('should handle system and hidden files correctly', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*'],
      });

      const files = [
        '.git/config',
        '.gitignore',
        '.DS_Store',
        '$RECYCLE.BIN',
        'Thumbs.db',
        '~temp.txt',
      ];

      vi.mocked(globby).mockResolvedValue(['.gitignore']); // Only .gitignore should be included

      const result = await searchFiles('/test/dir', mockConfig);
      expect(result).toEqual(['.gitignore']);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle cyclic symbolic links', async () => {
      const mockConfig = createMockConfig();

      vi.mocked(globby).mockImplementation(() => {
                throw new Error('ELOOP: too many symbolic links');
              });

await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
expect(logger.error).toHaveBeenCalledWith(
  expect.stringContaining('too many symbolic links'),
  expect.any(Error)
);
    });

it('should handle temporary unavailable resources', async () => {
  const mockConfig = createMockConfig();

  vi.mocked(globby).mockImplementation(() => {
    throw new Error('EAGAIN: resource temporarily unavailable');
  });

  await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
  expect(logger.error).toHaveBeenCalled();
});

it('should handle out of memory errors', async () => {
  const mockConfig = createMockConfig();

  vi.mocked(globby).mockImplementation(() => {
    const error = new Error('ENOMEM: out of memory');
    error.name = 'ResourceError';
    throw error;
  });

  await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
  expect(logger.error).toHaveBeenCalled();
});
  });

describe('File System Limits', () => {
  it('should handle maximum number of open files', async () => {
    const mockConfig = createMockConfig();
    const manyFiles = Array.from({ length: 10000 }, (_, i) => `file${i}.js`);

    vi.mocked(globby).mockResolvedValue(manyFiles);

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toHaveLength(10000);
    expect(result[0]).toBe('file0.js');
    expect(result[9999]).toBe('file9999.js');
  });

  it('should handle maximum path length limits', async () => {
    const mockConfig = createMockConfig();
    // Create a path that exceeds typical OS limits
    const longPath = 'a'.repeat(4096) + '.js';

    vi.mocked(globby).mockImplementation(() => {
      throw new Error('ENAMETOOLONG: file name too long');
    });

    await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('Race Conditions', () => {
  it('should handle files that disappear during processing', async () => {
    const mockConfig = createMockConfig();

    let firstCall = true;
    vi.mocked(globby).mockImplementation(async () => {
      if (firstCall) {
        firstCall = false;
        return ['file1.js', 'file2.js'];
      }
      throw new Error('ENOENT: no such file or directory');
    });

    await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle files that change permissions during processing', async () => {
    const mockConfig = createMockConfig();

    let firstCall = true;
    vi.mocked(globby).mockImplementation(async () => {
      if (firstCall) {
        firstCall = false;
        return ['file1.js'];
      }
      throw new Error('EACCES: permission denied');
    });

    await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('Pattern Validation', () => {
  it('should handle invalid glob patterns', async () => {
    const mockConfig = createMockConfig({
      include: ['[invalid-pattern'],
    });

    vi.mocked(globby).mockImplementation(() => {
      throw new Error('Invalid pattern: [invalid-pattern');
    });

    await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle empty glob patterns', async () => {
    const mockConfig = createMockConfig({
      include: [''],
    });

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toEqual([]);
  });

  it('should handle patterns with only wildcards', async () => {
    const mockConfig = createMockConfig({
      include: ['**'],
    });

    vi.mocked(globby).mockResolvedValue([
      'file1.js',
      'dir/file2.js',
    ]);

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toEqual(['dir/file2.js', 'file1.js']);
  });
});

describe('Filesystem Type Edge Cases', () => {
  it('should handle case-sensitive vs case-insensitive filesystems', async () => {
    const mockConfig = createMockConfig();

    vi.mocked(globby).mockResolvedValue([
      'File.js',
      'file.js',
      'FILE.js',
    ]);

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toHaveLength(3);
    expect(new Set(result)).toHaveLength(3); // All entries should be unique
  });

  it('should handle non-standard filesystems', async () => {
    const mockConfig = createMockConfig();
    const nonStandardPaths = [
      'extended-attributes.js',
      'alternate-data-streams.js:stream',
      'resource-fork/file.js',
    ];

    vi.mocked(globby).mockResolvedValue(nonStandardPaths);

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toEqual(nonStandardPaths);
  });

  it('should handle network filesystem timeouts', async () => {
    const mockConfig = createMockConfig();

    vi.mocked(globby).mockImplementation(() => {
      throw new Error('ETIMEDOUT: operation timed out');
    });

    await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('Memory Usage', () => {
  it('should handle large directory listings efficiently', async () => {
    const mockConfig = createMockConfig();
    const largeFileList = Array.from(
      { length: 100000 },
      (_, i) => `file${i}.js`
    );

    vi.mocked(globby).mockResolvedValue(largeFileList);

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toHaveLength(100000);
  });

  it('should handle deep recursion efficiently', async () => {
    const mockConfig = createMockConfig();
    const deepPaths = Array.from(
      { length: 1000 },
      (_, i) => Array(i + 1).fill('dir').join(path.sep) + path.sep + 'file.js'
    );

    vi.mocked(globby).mockResolvedValue(deepPaths);

    const result = await searchFiles('/test/dir', mockConfig);
    expect(result).toHaveLength(1000);
  });
});
});

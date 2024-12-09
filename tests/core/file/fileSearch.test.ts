import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { searchFiles, findFiles, matchPattern, SearchOptions } from '../../../src/core/file/fileSearch.js';
import { logger } from '../../../src/shared/logger.js';
import globby from 'globby';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('globby');
vi.mock('../../../src/shared/logger.js');
vi.mock('../../../src/core/file/fileUtils.js', () => ({
  exists: vi.fn().mockResolvedValue(true),
  isDirectory: vi.fn().mockResolvedValue(true)
}));

describe('fileSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('searchFiles', () => {
    test('finds files with matching content', async () => {
      const mockFiles = ['/test/dir/file1.txt', '/test/dir/file2.txt'];
      vi.mocked(globby).mockResolvedValue(mockFiles);
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as any);
      vi.mocked(fs.readFile).mockImplementation((file) => {
        const content = {
          '/test/dir/file1.txt': 'test content here\nmore content',
          '/test/dir/file2.txt': 'no match here'
        }[file as string];
        return Promise.resolve(content);
      });

      const results = await searchFiles('/test/dir', 'test', {
        caseSensitive: true,
        includeDotFiles: false
      });

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('file1.txt');
      expect(results[0].matches).toHaveLength(1);
      expect(results[0].matches![0].content).toBe('test content here');
    });

    test('handles case-insensitive search', async () => {
      const mockFiles = ['/test/dir/file1.txt'];
      vi.mocked(globby).mockResolvedValue(mockFiles);
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue('TEST content here');

      const results = await searchFiles('/test/dir', 'test', {
        caseSensitive: false
      });

      expect(results).toHaveLength(1);
      expect(results[0].matches).toHaveLength(1);
    });

    test('respects maxDepth option', async () => {
      await searchFiles('/test/dir', 'test', { maxDepth: 2 });

      expect(globby).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ deep: 2 })
      );
    });

    test('handles file read errors gracefully', async () => {
      const mockFiles = ['/test/dir/file1.txt'];
      vi.mocked(globby).mockResolvedValue(mockFiles);
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as any);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

      const results = await searchFiles('/test/dir', 'test');
      expect(results).toHaveLength(0);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findFiles', () => {
    test('finds files matching patterns', async () => {
      const mockFiles = [
        '/test/dir/file1.txt',
        '/test/dir/subdir/file2.txt'
      ];
      vi.mocked(globby).mockResolvedValue(mockFiles);

      const results = await findFiles('/test/dir', ['**/*.txt']);

      expect(results).toHaveLength(2);
      expect(results).toContain('file1.txt');
      expect(results).toContain('subdir/file2.txt');
    });

    test('respects exclude patterns', async () => {
      await findFiles('/test/dir', ['**/*.txt'], {
        exclude: ['**/node_modules/**']
      });

      expect(globby).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ignore: ['**/node_modules/**']
        })
      );
    });

    test('handles globby errors', async () => {
      vi.mocked(globby).mockRejectedValue(new Error('Glob error'));

      await expect(findFiles('/test/dir', ['**/*.txt']))
        .rejects.toThrow('Glob error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('matchPattern', () => {
    test('matches file path against pattern', () => {
      expect(matchPattern('file.txt', '*.txt')).toBe(true);
      expect(matchPattern('file.js', '*.txt')).toBe(false);
    });

    test('handles case sensitivity', () => {
      expect(matchPattern('File.txt', '*.txt', false)).toBe(true);
      expect(matchPattern('File.txt', '*.txt', true)).toBe(false);
    });

    test('handles errors gracefully', () => {
      expect(() => matchPattern('file.txt', '[')).toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

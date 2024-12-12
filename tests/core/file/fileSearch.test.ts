import { describe, expect, test, beforeEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { searchFiles, findFiles, matchPattern, SearchOptions } from '../../../src/core/file/fileSearch.js';
import { logger } from '../../../src/shared/logger.js';
import globby from 'globby';
import { exists, isDirectory } from '../../../src/core/file/fileUtils.js';

// Mock dependencies
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  return {
    ...actual,
    stat: vi.fn(),
    readFile: vi.fn()
  };
});

vi.mock('globby', () => ({
  default: vi.fn(),
  globby: vi.fn()
}));

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    error: vi.fn()
  }
}));

vi.mock('../../../src/core/file/fileUtils.js', () => ({
  exists: vi.fn(),
  isDirectory: vi.fn()
}));

describe('fileSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mocks
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(isDirectory).mockResolvedValue(true);
    vi.mocked(globby.default || globby).mockResolvedValue([]);
    
    // Use vi.mocked with the imported fs module
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as any);
    vi.mocked(fs.readFile).mockResolvedValue('');
  });

  describe('searchFiles', () => {
    test('finds files with matching content', async () => {
      const mockFiles = ['/test/dir/file1.txt', '/test/dir/file2.txt'];
      vi.mocked(globby.default || globby).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockImplementation((file) => {
        const content = {
          '/test/dir/file1.txt': 'test content here\nmore content',
          '/test/dir/file2.txt': 'no match here'
        }[file as string] || '';
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
      vi.mocked(globby.default || globby).mockResolvedValue(mockFiles);
      vi.mocked(fs.readFile).mockResolvedValue('TEST content here');

      const results = await searchFiles('/test/dir', 'test', {
        caseSensitive: false
      });

      expect(results).toHaveLength(1);
      expect(results[0].matches).toHaveLength(1);
    });

    test('respects maxDepth option', async () => {
      await searchFiles('/test/dir', 'test', { maxDepth: 2 });

      expect(globby.default || globby).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ deep: 2 })
      );
    });

    test('handles file read errors gracefully', async () => {
      const mockFiles = ['/test/dir/file1.txt'];
      vi.mocked(globby.default || globby).mockResolvedValue(mockFiles);
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
      vi.mocked(globby.default || globby).mockResolvedValue(mockFiles);

      const results = await findFiles('/test/dir', ['**/*.txt']);

      expect(results).toHaveLength(2);
      expect(results).toContain('file1.txt');
      expect(results).toContain('subdir/file2.txt');
    });

    test('respects exclude patterns', async () => {
      await findFiles('/test/dir', ['**/*.txt'], {
        exclude: ['**/node_modules/**']
      });

      expect(globby.default || globby).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ignore: ['**/node_modules/**']
        })
      );
    });

    test('handles globby errors', async () => {
      // Explicitly mock globby to throw an error
      vi.mocked(globby.default || globby).mockRejectedValue(new Error('Glob error'));

      // Spy on logger.error
      const errorSpy = vi.spyOn(logger, 'error');

      // Expect the function to throw the original error
      await expect(findFiles('/test/dir', ['**/*.txt']))
        .rejects.toThrow('Glob error');

      // Verify logger.error was called
      expect(errorSpy).toHaveBeenCalled();

      // Restore the original implementation
      errorSpy.mockRestore();
    });
  });

  describe('matchPattern', () => {
    test('handles case sensitivity', () => {
      // Case-insensitive match
      expect(matchPattern('File.txt', '*.txt', false)).toBe(true);
      
      // Case-sensitive match
      expect(matchPattern('File.txt', '*.txt', true)).toBe(true);
      expect(matchPattern('FILE.txt', '*.txt', true)).toBe(true);
      
      // Truly different case should fail in case-sensitive mode
      expect(matchPattern('file.TXT', '*.txt', true)).toBe(false);
    });

    test('handles errors gracefully', () => {
      // Explicitly mock logger.error
      const errorSpy = vi.spyOn(logger, 'error');
      
      // Call matchPattern with an invalid pattern
      const result = matchPattern('file.txt', '[');
      
      // Verify logger.error was called and result is false
      expect(errorSpy).toHaveBeenCalled();
      expect(result).toBe(false);
      
      // Restore the original implementation
      errorSpy.mockRestore();
    });
  });
});

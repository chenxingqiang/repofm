import path from 'node:path';
import { jest, describe, expect, test } from '@jest/globals';
import { sortPaths } from '../../../src/core/file/filePathSort.js';

describe('filePathSort', () => {
  const sep = path.sep;

  describe('Basic Sorting', () => {
    test('should sort directories before files', () => {
      const input = ['file.txt', `dir${sep}`, 'another_file.js', `another_dir${sep}`];
      const expected = [`another_dir${sep}`, `dir${sep}`, 'another_file.js', 'file.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should sort alphabetically within same type', () => {
      const input = ['b.txt', 'a.txt', `d${sep}`, `c${sep}`];
      const expected = [`c${sep}`, `d${sep}`, 'a.txt', 'b.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle empty array', () => {
      expect(sortPaths([])).toEqual([]);
    });
  });

  describe('Path Normalization', () => {
    test('should handle mixed path separators', async () => {
      const input = [
        'dir\\file.txt', 
        'dir/another.txt', 
        'dir\\subdir\\', 
        'dir/subdir2/'
      ];
      const expected = [
        'dir/subdir/',
        'dir/subdir2/',
        'dir/another.txt',
        'dir/file.txt'
      ].map(p => p.replace(/\//g, sep));
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle multiple consecutive separators', async () => {
      const input = [
        'dir//file.txt',
        'dir///subdir///',
        'dir\\\\file2.txt'
      ];
      const expected = [
        'dir/subdir/',
        'dir/file.txt',
        'dir/file2.txt'
      ].map(p => p.replace(/\//g, sep));
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Special Cases', () => {
    test('should handle hidden files and directories', () => {
      const input = ['.git/', '.gitignore', '.env', 'normal.txt'];
      const expected = ['.git/', '.env', '.gitignore', 'normal.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle special file priorities', async () => {
      const input = [
        'src/index.ts',
        'random.txt',
        'package.json',
        'README.md',
        'Dockerfile',
        'tsconfig.json'
      ];
      const expected = [
        'package.json',
        'README.md',
        'tsconfig.json',
        'Dockerfile',
        'src/index.ts',
        'random.txt'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle relative paths', () => {
      const input = ['./src/index.js', '../lib/util.js', '../../root.js'];
      const expected = ['../../root.js', '../lib/util.js', './src/index.js'];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Nested Paths', () => {
    test('should sort nested directories correctly', async () => {
      const input = [
        'root.txt',
        'deep/file.txt',
        'deep/nested/dir/',
        'shallow/'
      ];
      const expected = [
        'deep/nested/dir/',
        'shallow/',
        'deep/file.txt',
        'root.txt'
      ].map(p => p.replace(/\//g, sep));
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle complex nested paths with special files', async () => {
      const input = [
        'src/components/index.ts',
        'package.json',
        'tests/__tests__/',
        'src/README.md',
        'src/index.ts'
      ];
      const expected = [
        'tests/__tests__/',
        'package.json',
        'src/README.md',
        'src/index.ts',
        'src/components/index.ts'
      ].map(p => p.replace(/\//g, sep));
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Edge Cases', () => {
    test('should handle paths with special characters', () => {
      const input = ['file@2x.png', 'file#1.txt', 'file$special.js'];
      const expected = ['file#1.txt', 'file$special.js', 'file@2x.png'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle paths with numbers', () => {
      const input = ['file2.txt', 'file10.txt', 'file1.txt'];
      const expected = ['file1.txt', 'file2.txt', 'file10.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle paths with mixed case', async () => {
      const input = [
        'Dir/',
        'dir/',
        'DIR/',
        'File.txt',
        'file.txt',
        'FILE.txt'
      ];
      const expected = [
        'DIR/',
        'Dir/',
        'dir/',
        'FILE.txt',
        'File.txt',
        'file.txt'
      ].map(p => p.replace(/\//g, sep));
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Project-Specific Patterns', () => {
    test('should handle common web development patterns', () => {
      const input = [
        'src/',
        'public/',
        'dist/',
        'node_modules/',
        'package.json',
        'README.md'
      ];
      const expected = [
        'dist/',
        'node_modules/',
        'public/',
        'src/',
        'package.json',
        'README.md'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle test-related paths', async () => {
      const input = [
        'src/components/__tests__/',
        '__tests__/unit/',
        'tests/integration/',
        'jest.config.js',
        'test.setup.js'
      ];
      const expected = [
        '__tests__/unit/',
        'src/components/__tests__/',
        'tests/integration/',
        'jest.config.js',
        'test.setup.js'
      ].map(p => p.replace(/\//g, sep));
      expect(sortPaths(input)).toEqual(expected);
    });
  });
});

import path from 'node:path';
import { describe, expect, test } from 'vitest';
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
    test('should handle mixed path separators', () => {
      const input = ['dir\\file.txt', 'dir/another.txt', 'dir\\subdir\\', 'dir/subdir2/'];
      const expected = ['dir/subdir2/', 'dir/subdir/', 'dir/another.txt', 'dir/file.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle multiple consecutive separators', () => {
      const input = ['dir//file.txt', 'dir///subdir///', 'dir\\\\file2.txt'];
      const expected = ['dir/subdir/', 'dir/file.txt', 'dir/file2.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Special Cases', () => {
    test('should handle hidden files and directories', () => {
      const input = ['.config', '.git/', 'normal.txt', '.hidden.txt'];
      const expected = ['.git/', '.config', '.hidden.txt', 'normal.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle special file priorities', () => {
      const input = [
        'random.txt',
        'README.md',
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'Dockerfile'
      ];
      const expected = [
        'README.md',
        'Dockerfile',
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'random.txt'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle relative paths', () => {
      const input = ['./file.txt', '../parent.txt', './dir/', '../parentdir/'];
      const expected = ['../parentdir/', '../parent.txt', './dir/', './file.txt'];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Nested Paths', () => {
    test('should sort nested directories correctly', () => {
      const input = [
        `deep${sep}nested${sep}dir${sep}`,
        `deep${sep}file.txt`,
        `shallow${sep}`,
        'root.txt'
      ];
      const expected = [
        `deep${sep}nested${sep}dir${sep}`,
        `shallow${sep}`,
        `deep${sep}file.txt`,
        'root.txt'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle complex nested paths with special files', () => {
      const input = [
        `src${sep}components${sep}index.ts`,
        `src${sep}README.md`,
        `tests${sep}__tests__${sep}`,
        'package.json',
        `src${sep}index.ts`
      ];
      const expected = [
        `tests${sep}__tests__${sep}`,
        'package.json',
        `src${sep}README.md`,
        `src${sep}components${sep}index.ts`,
        `src${sep}index.ts`
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Edge Cases', () => {
    test('should handle paths with special characters', () => {
      const input = [
        'file with spaces.txt',
        'file#with#hash.txt',
        'file@with@at.txt',
        'file-with-dashes.txt',
        'file_with_underscores.txt'
      ];
      const expected = [
        'file with spaces.txt',
        'file#with#hash.txt',
        'file@with@at.txt',
        'file-with-dashes.txt',
        'file_with_underscores.txt'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle paths with numbers', () => {
      const input = [
        'dir1/',
        'dir2/',
        'dir10/',
        'file1.txt',
        'file2.txt',
        'file10.txt'
      ];
      const expected = [
        'dir1/',
        'dir2/',
        'dir10/',
        'file1.txt',
        'file2.txt',
        'file10.txt'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle paths with mixed case', () => {
      const input = [
        'Dir/',
        'DIR/',
        'dir/',
        'File.txt',
        'FILE.txt',
        'file.txt'
      ];
      const expected = [
        'Dir/',
        'DIR/',
        'dir/',
        'File.txt',
        'FILE.txt',
        'file.txt'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Project-Specific Patterns', () => {
    test('should handle common web development patterns', () => {
      const input = [
        'node_modules/',
        'public/assets/',
        'README.md',
        'package.json',
        'tsconfig.json',
        '.env',
        'index.html',
        `src${sep}components${sep}Button.jsx`,
        `src${sep}pages${sep}Home.tsx`
      ];
      const expected = [
        'node_modules/',
        'public/assets/',
        'README.md',
        'package.json',
        'tsconfig.json',
        '.env',
        'index.html',
        'src/components/Button.jsx',
        'src/pages/Home.tsx'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle test-related paths', () => {
      const input = [
        '__tests__/unit/',
        'tests/integration/',
        'src/components/__tests__/',
        'jest.config.js',
        'test.setup.js'
      ];
      const expected = [
        '__tests__/unit/',
        'tests/integration/',
        'src/components/__tests__/',
        'jest.config.js',
        'test.setup.js'
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });
});

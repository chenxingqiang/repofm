// tests/core/file/fileTreeGenerate.test.ts

import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { generateFileTree, generateTreeString, treeToString } from '../../../src/core/file/fileTreeGenerate.js';

describe('fileTreeGenerate', () => {
  const sep = path.sep;

  describe('generateFileTree', () => {
    test('should generate correct tree structure for flat files', () => {
      const files = [
        'file1.txt',
        'file2.js',
        'file3.css',
      ];

      const tree = generateFileTree(files);

      expect(tree.name).toBe('root');
      expect(tree.isDirectory).toBe(true);
      expect(tree.children).toHaveLength(3);
      expect(tree.children.map(c => c.name)).toEqual(['file1.txt', 'file2.js', 'file3.css']);
      expect(tree.children.every(c => !c.isDirectory)).toBe(true);
    });

    test('should generate correct tree structure for nested files', () => {
      const files = [
        `src${sep}index.js`,
        `src${sep}utils${sep}helper.js`,
        `tests${sep}test.js`,
      ];

      const tree = generateFileTree(files);

      expect(tree.name).toBe('root');
      expect(tree.children).toHaveLength(2); // src and tests

      // Check src directory
      const src = tree.children.find(c => c.name === 'src');
      expect(src?.isDirectory).toBe(true);
      expect(src?.children).toHaveLength(2); // index.js and utils

      // Check utils directory
      const utils = src?.children.find(c => c.name === 'utils');
      expect(utils?.isDirectory).toBe(true);
      expect(utils?.children).toHaveLength(1); // helper.js
    });

    test('should handle empty input', () => {
      const tree = generateFileTree([]);

      expect(tree.name).toBe('root');
      expect(tree.isDirectory).toBe(true);
      expect(tree.children).toHaveLength(0);
    });

    test('should handle deep directory structure', () => {
      const files = [
        `a${sep}b${sep}c${sep}d${sep}file.txt`,
      ];

      const tree = generateFileTree(files);

      let current = tree;
      ['a', 'b', 'c', 'd'].forEach(dir => {
        const child = current.children.find(c => c.name === dir);
        expect(child).toBeDefined();
        expect(child?.isDirectory).toBe(true);
        current = child!;
      });

      expect(current.children[0].name).toBe('file.txt');
      expect(current.children[0].isDirectory).toBe(false);
    });
  });

  describe('treeToString', () => {
    test('should generate correct string representation for flat structure', () => {
      const files = [
        'file1.txt',
        'file2.js',
        'file3.css',
      ];

      const tree = generateFileTree(files);
      const result = treeToString(tree);

      const expected = [
        'file1.txt',
        'file2.js',
        'file3.css',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should generate correct string representation for nested structure', () => {
      const files = [
        `src${sep}index.js`,
        `src${sep}utils${sep}helper.js`,
        `tests${sep}test.js`,
      ];

      const tree = generateFileTree(files);
      const result = treeToString(tree);

      const expected = [
        'src/',
        '  index.js',
        '  utils/',
        '    helper.js',
        'tests/',
        '  test.js',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should handle empty tree', () => {
      const tree = generateFileTree([]);
      const result = treeToString(tree);

      expect(result).toBe('');
    });

    test('should handle deep nesting', () => {
      const files = [
        `a${sep}b${sep}c${sep}d${sep}file.txt`,
      ];

      const tree = generateFileTree(files);
      const result = treeToString(tree);

      const expected = [
        'a/',
        '  b/',
        '    c/',
        '      d/',
        '        file.txt',
      ].join('\n');

      expect(result).toBe(expected);
    });
  });

  describe('generateTreeString', () => {
    test('should generate complete tree string for mixed structure', () => {
      const files = [
        'root.txt',
        `src${sep}index.js`,
        `src${sep}components${sep}Button.jsx`,
        `src${sep}utils${sep}helper.js`,
        `tests${sep}unit${sep}test.js`,
        `tests${sep}integration${sep}test.js`,
        'package.json',
      ];

      const result = generateTreeString(files);

      const expected = [
        'package.json',
        'root.txt',
        'src/',
        '  components/',
        '    Button.jsx',
        '  index.js',
        '  utils/',
        '    helper.js',
        'tests/',
        '  integration/',
        '    test.js',
        '  unit/',
        '    test.js',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should sort directories before files', () => {
      const files = [
        'file.txt',
        `dir${sep}file.txt`,
        'another.txt',
      ];

      const result = generateTreeString(files);

      const expected = [
        'dir/',
        '  file.txt',
        'another.txt',
        'file.txt',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should sort files alphabetically within directories', () => {
      const files = [
        `dir${sep}c.txt`,
        `dir${sep}a.txt`,
        `dir${sep}b.txt`,
      ];

      const result = generateTreeString(files);

      const expected = [
        'dir/',
        '  a.txt',
        '  b.txt',
        '  c.txt',
      ].join('\n');

      expect(result).toBe(expected);
    });
  });

  describe('Edge Cases', () => {
    test('should handle files with special characters in names', () => {
      const files = [
        'file with spaces.txt',
        'file-with-dashes.txt',
        'file_with_underscores.txt',
        'file.with.dots.txt',
      ];

      const result = generateTreeString(files);

      const expected = [
        'file with spaces.txt',
        'file-with-dashes.txt',
        'file.with.dots.txt',
        'file_with_underscores.txt',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should handle files with unicode characters', () => {
      const files = [
        '文件.txt',
        'ファイル.txt',
        'файл.txt',
        '파일.txt',
      ];

      const result = generateTreeString(files);

      expect(result.split('\n')).toHaveLength(4);
      expect(result).toContain('文件.txt');
      expect(result).toContain('ファイル.txt');
      expect(result).toContain('файл.txt');
      expect(result).toContain('파일.txt');
    });

    test('should handle files with same names in different directories', () => {
      const files = [
        `dir1${sep}file.txt`,
        `dir2${sep}file.txt`,
        `dir1${sep}subdir${sep}file.txt`,
      ];

      const result = generateTreeString(files);

      const expected = [
        'dir1/',
        '  subdir/',
        '    file.txt',
        '  file.txt',
        'dir2/',
        '  file.txt',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should handle hidden files and directories', () => {
      const files = [
        '.gitignore',
        '.env',
        `${sep}.config${sep}file.txt`,
        '.hidden-file.txt',
      ];

      const result = generateTreeString(files);

      const expected = [
        '.config/',
        '  file.txt',
        '.env',
        '.gitignore',
        '.hidden-file.txt',
      ].join('\n');

      expect(result).toBe(expected);
    });

    test('should handle mixed case filenames', () => {
      const files = [
        'File.txt',
        'file.txt',
        'FILE.txt',
        'FiLe.txt',
      ];

      const result = generateTreeString(files);

      expect(result.split('\n')).toHaveLength(4);
      files.forEach(file => {
        expect(result).toContain(file);
      });
    });

    test('should handle extremely deep directory structures', () => {
      const depth = 50;
      const pathParts = Array(depth).fill('dir');
      const files = [
        pathParts.join(sep) + `${sep}file.txt`,
      ];

      const result = generateTreeString(files);

      expect(result.split('\n')).toHaveLength(depth + 1); // dirs + file
      expect(result).toContain('file.txt');
      expect(result.match(/dir\//g)).toHaveLength(depth);
    });

    test('should handle large number of files and directories', () => {
      const numFiles = 1000;
      const files = Array.from({ length: numFiles }, (_, i) =>
        i % 2 === 0 ? `dir${i}${sep}file${i}.txt` : `file${i}.txt`
      );

      const result = generateTreeString(files);

      const lines = result.split('\n');
      expect(lines.length).toBe(numFiles + numFiles / 2); // files + directories
    });
  });
});

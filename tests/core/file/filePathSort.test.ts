import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { sortPaths } from '../../../src/core/file/filePathSort.js';

describe('filePathSort', () => {
  const sep = path.sep;

  test('should sort directories before files', () => {
    const input = ['file.txt', `dir${sep}`, 'another_file.js', `another_dir${sep}`];
    const expected = [`another_dir${sep}`, `dir${sep}`, 'another_file.js', 'file.txt'];
    expect(sortPaths(input)).toEqual(expected);
  });

  test('should sort subdirectories correctly', () => {
    const input = [`dir${sep}subdir${sep}file.txt`, `dir${sep}file.js`, `dir${sep}subdir${sep}`, 'file.txt'];
    const expected = [`dir${sep}subdir${sep}`, `dir${sep}subdir${sep}file.txt`, `dir${sep}file.js`, 'file.txt'];
    expect(sortPaths(input)).toEqual(expected);
  });

  test('should sort files alphabetically within the same directory', () => {
    const input = [`dir${sep}c.txt`, `dir${sep}a.txt`, `dir${sep}b.txt`];
    const expected = [`dir${sep}a.txt`, `dir${sep}b.txt`, `dir${sep}c.txt`];
    expect(sortPaths(input)).toEqual(expected);
  });

  test('should handle empty input', () => {
    expect(sortPaths([])).toEqual([]);
  });

  test('should handle complex directory structure', () => {
    const input = [
      `src${sep}utils${sep}file3.ts`,
      `src${sep}index.ts`,
      `tests${sep}utils${sep}a.ts`,
      `src${sep}utils${sep}b.ts`,
      'package.json',
      'README.md',
      `src${sep}components${sep}Component.tsx`,
    ];
    const expected = [
      `src${sep}components${sep}Component.tsx`,
      `src${sep}utils${sep}b.ts`,
      `src${sep}utils${sep}file3.ts`,
      `src${sep}index.ts`,
      `tests${sep}utils${sep}a.ts`,
      'package.json',
      'README.md',
    ];
    expect(sortPaths(input)).toEqual(expected);
  });

  test('should handle paths with multiple separators', () => {
    const input = [`a${sep}b${sep}c`, `a${sep}b`, `a${sep}b${sep}`];
    const expected = [`a${sep}b`, `a${sep}b${sep}`, `a${sep}b${sep}c`];
    expect(sortPaths(input)).toEqual(expected);
  });

  test('should be case-insensitive', () => {
    const input = [`B${sep}`, `a${sep}`, 'C', 'd'];
    const expected = [`a${sep}`, `B${sep}`, 'C', 'd'];
    expect(sortPaths(input)).toEqual(expected);
  });
});

describe('filePathSort', () => {
  const sep = path.sep;

  describe('Basic Sorting', () => {
    test('should sort directories before files', () => {
      const input = [
        'file.txt',
        `dir${sep}`,
        'another_file.js',
        `another_dir${sep}`,
      ];
      const expected = [
        `another_dir${sep}`,
        `dir${sep}`,
        'another_file.js',
        'file.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should sort files alphabetically within the same directory', () => {
      const input = [
        'z.txt',
        'a.txt',
        'c.txt',
        'b.txt',
      ];
      const expected = [
        'a.txt',
        'b.txt',
        'c.txt',
        'z.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle empty array', () => {
      expect(sortPaths([])).toEqual([]);
    });

    test('should handle array with single item', () => {
      expect(sortPaths(['file.txt'])).toEqual(['file.txt']);
    });
  });

  describe('Directory Structure Sorting', () => {
    test('should sort subdirectories correctly', () => {
      const input = [
        `parent${sep}child${sep}file.txt`,
        `parent${sep}file.js`,
        `parent${sep}child${sep}`,
        'file.txt',
      ];
      const expected = [
        `parent${sep}child${sep}`,
        `parent${sep}child${sep}file.txt`,
        `parent${sep}file.js`,
        'file.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle deep directory structures', () => {
      const input = [
        `a${sep}b${sep}c${sep}d.txt`,
        `a${sep}b${sep}c${sep}`,
        `a${sep}b${sep}`,
        `a${sep}`,
      ];
      const expected = [
        `a${sep}`,
        `a${sep}b${sep}`,
        `a${sep}b${sep}c${sep}`,
        `a${sep}b${sep}c${sep}d.txt`,
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle mixed directory depths', () => {
      const input = [
        `deep${sep}deeper${sep}deepest${sep}file.txt`,
        'root.txt',
        `shallow${sep}file.txt`,
      ];
      const expected = [
        `deep${sep}deeper${sep}deepest${sep}file.txt`,
        `shallow${sep}file.txt`,
        'root.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Complex File Types', () => {
    test('should handle various file extensions', () => {
      const input = [
        'doc.pdf',
        'script.js',
        'style.css',
        'readme.md',
      ];
      const expected = [
        'doc.pdf',
        'readme.md',
        'script.js',
        'style.css',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle files without extensions', () => {
      const input = [
        'README',
        'license',
        'Dockerfile',
        'makefile',
      ];
      const expected = [
        'Dockerfile',
        'README',
        'license',
        'makefile',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle hidden files', () => {
      const input = [
        '.gitignore',
        '.env',
        'regular.txt',
        '.config',
      ];
      const expected = [
        '.config',
        '.env',
        '.gitignore',
        'regular.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Case Sensitivity', () => {
    test('should handle mixed case filenames', () => {
      const input = [
        'Alpha.txt',
        'beta.txt',
        'GAMMA.txt',
        'Delta.txt',
      ];
      const expected = [
        'Alpha.txt',
        'beta.txt',
        'Delta.txt',
        'GAMMA.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle same name with different cases', () => {
      const input = [
        'file.txt',
        'File.txt',
        'FILE.txt',
        'FiLe.txt',
      ];
      expect(sortPaths(input)).toEqual(input.sort((a, b) => a.localeCompare(b)));
    });
  });

  describe('Special Characters', () => {
    test('should handle special characters in filenames', () => {
      const input = [
        'file-1.txt',
        'file_2.txt',
        'file 3.txt',
        'file#4.txt',
      ];
      const expected = [
        'file 3.txt',
        'file#4.txt',
        'file-1.txt',
        'file_2.txt',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle unicode characters', () => {
      const input = [
        'файл.txt',
        'ファイル.txt',
        '文件.txt',
        'file.txt',
      ];
      expect(sortPaths(input)).toEqual(input.sort((a, b) => a.localeCompare(b)));
    });
  });

  describe('Project-Specific Patterns', () => {
    test('should handle common web development patterns', () => {
      const input = [
        `src${sep}components${sep}Button.jsx`,
        `src${sep}pages${sep}Home.tsx`,
        `src${sep}styles${sep}main.css`,
        'package.json',
      ];
      const expected = [
        `src${sep}components${sep}Button.jsx`,
        `src${sep}pages${sep}Home.tsx`,
        `src${sep}styles${sep}main.css`,
        'package.json',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle test files and directories', () => {
      const input = [
        `tests${sep}unit${sep}`,
        `tests${sep}integration${sep}`,
        `__tests__${sep}components${sep}`,
        'jest.config.js',
      ];
      const expected = [
        `__tests__${sep}components${sep}`,
        `tests${sep}integration${sep}`,
        `tests${sep}unit${sep}`,
        'jest.config.js',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });

    test('should handle build and configuration files', () => {
      const input = [
        'webpack.config.js',
        `dist${sep}`,
        `build${sep}`,
        '.babelrc',
      ];
      const expected = [
        `build${sep}`,
        `dist${sep}`,
        '.babelrc',
        'webpack.config.js',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });

  describe('Edge Cases', () => {
    test('should handle paths with multiple separators', () => {
      const input = [
        `a${sep}${sep}b${sep}${sep}c`,
        `a${sep}b${sep}${sep}c`,
        `a${sep}b${sep}c`,
      ];
      expect(sortPaths(input)).toEqual(input.sort());
    });

    test('should handle relative paths', () => {
      const input = [
        `.${sep}file.txt`,
        `..${sep}file.txt`,
        `${sep}file.txt`,
      ];
      expect(sortPaths(input)).toEqual(input.sort());
    });

    test('should handle empty path components', () => {
      const input = [
        `${sep}path${sep}to${sep}file`,
        `path${sep}${sep}to${sep}file`,
        `path${sep}to${sep}${sep}file`,
      ];
      expect(sortPaths(input)).toEqual(input.sort());
    });

    test('should handle path with trailing separator', () => {
      const input = [
        `dir${sep}subdir`,
        `dir${sep}subdir${sep}`,
        `dir${sep}`,
        'dir',
      ];
      const expected = [
        `dir${sep}`,
        `dir${sep}subdir${sep}`,
        `dir${sep}subdir`,
        'dir',
      ];
      expect(sortPaths(input)).toEqual(expected);
    });
  });
});


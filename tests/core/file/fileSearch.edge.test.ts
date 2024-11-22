import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { searchFiles } from '../../../src/core/file/fileSearch.js';
import { createTempDir, removeTempDir } from '../../testing/testUtils.js';

describe('fileSearch edge cases', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await removeTempDir(tempDir);
  });

  test('handles deep directory structures', async () => {
    // Create a deep directory structure
    const depth = 20;
    let currentPath = tempDir;
    for (let i = 0; i < depth; i++) {
      currentPath = path.join(currentPath, `level${i}`);
      await fs.mkdir(currentPath);
      await fs.writeFile(path.join(currentPath, 'file.txt'), 'content');
    }

    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(depth);
    expect(files[depth - 1]).toContain(`level${depth - 1}/file.txt`);
  });

  test('handles files with special characters in names', async () => {
    const specialFiles = [
      'file with spaces.txt',
      'file_with_!@#$%^&*()_+.txt',
      '文件名.txt',
      'file.with.multiple.dots.txt',
      'file-with-dashes.txt',
      'file_with_underscores.txt',
      '.hidden-file.txt',
      'UPPERCASE.txt',
      'lowercase.txt',
      'MixedCase.txt'
    ];

    for (const file of specialFiles) {
      await fs.writeFile(path.join(tempDir, file), 'content');
    }

    const files = await searchFiles(tempDir, { dot: true });
    expect(files).toHaveLength(specialFiles.length);
    expect(files.sort()).toEqual(specialFiles.sort());
  });

  test('handles empty directories', async () => {
    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(0);
  });

  test('handles directories with only empty subdirectories', async () => {
    await fs.mkdir(path.join(tempDir, 'empty1'));
    await fs.mkdir(path.join(tempDir, 'empty2'));
    await fs.mkdir(path.join(tempDir, 'empty1', 'empty1.1'));

    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(0);
  });

  test('handles large number of files in single directory', async () => {
    const fileCount = 1000;
    const promises: Promise<void>[] = [];
    for (let i = 0; i < fileCount; i++) {
      promises.push(fs.writeFile(path.join(tempDir, `file${i}.txt`), 'content'));
    }
    await Promise.all(promises);

    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(fileCount);
    expect(files[0]).toBe('file0.txt');
    expect(files[fileCount - 1]).toBe(`file${fileCount - 1}.txt`);
  });

  test('handles cyclic symbolic links when followSymlinks is false', async () => {
    const subDir = path.join(tempDir, 'subdir');
    await fs.mkdir(subDir);
    await fs.writeFile(path.join(subDir, 'file.txt'), 'content');
    await fs.symlink(subDir, path.join(subDir, 'cycle'));

    const files = await searchFiles(tempDir, { followSymlinks: false });
    expect(files).toHaveLength(1);
    expect(files[0]).toBe('subdir/file.txt');
  });

  test('handles files with same name in different directories', async () => {
    const dirs = ['dir1', 'dir2', 'dir1/sub1', 'dir2/sub2'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(tempDir, dir), { recursive: true });
      await fs.writeFile(path.join(tempDir, dir, 'file.txt'), 'content');
    }

    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(4);
    expect(files).toContain('dir1/file.txt');
    expect(files).toContain('dir2/file.txt');
    expect(files).toContain('dir1/sub1/file.txt');
    expect(files).toContain('dir2/sub2/file.txt');
  });

  test('handles files with zero size', async () => {
    await fs.writeFile(path.join(tempDir, 'empty.txt'), '');
    await fs.writeFile(path.join(tempDir, 'notempty.txt'), 'content');

    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(2);
    expect(files).toContain('empty.txt');
    expect(files).toContain('notempty.txt');
  });

  test('handles complex glob patterns', async () => {
    const files = [
      'file1.txt',
      'file2.js',
      'dir1/file3.txt',
      'dir1/file4.js',
      'dir2/file5.txt',
      'dir2/file6.js',
      'dir1/sub/file7.txt',
      'dir2/sub/file8.js'
    ];

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, 'content');
    }

    const testCases = [
      {
        patterns: ['**/*.txt'],
        expected: files.filter(f => f.endsWith('.txt'))
      },
      {
        patterns: ['dir1/**/*.js'],
        expected: files.filter(f => f.startsWith('dir1/') && f.endsWith('.js'))
      },
      {
        patterns: ['**/sub/*.{txt,js}'],
        expected: files.filter(f => f.includes('/sub/'))
      },
      {
        patterns: ['dir2/**/file[5-8].*'],
        expected: files.filter(f => f.startsWith('dir2/') && /file[5-8]\./.test(f))
      }
    ];

    for (const { patterns, expected } of testCases) {
      const result = await searchFiles(tempDir, { patterns });
      expect(result.sort()).toEqual(expected.sort());
    }
  });

  test('handles custom ignore patterns', async () => {
    const files = [
      'file1.txt',
      'file1.js',
      'test/file2.txt',
      'test/file2.js',
      'build/file3.txt',
      'build/file3.js',
      'src/file4.txt',
      'src/file4.js'
    ];

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, 'content');
    }

    const result = await searchFiles(tempDir, {
      ignore: {
        patterns: ['**/test/**', '**/build/**', '**/*.js'],
        useGitignore: false,
        useDefaultPatterns: false
      }
    });

    expect(result).toHaveLength(2);
    expect(result).toContain('file1.txt');
    expect(result).toContain('src/file4.txt');
  });

  test('handles file names at max path length', async () => {
    // Create a file with a name that approaches the max path length
    const maxFileName = 'x'.repeat(255); // max file name length in most filesystems
    await fs.writeFile(path.join(tempDir, maxFileName), 'content');

    const files = await searchFiles(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toBe(maxFileName);
  });
});

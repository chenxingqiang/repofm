import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { loadFileConfig, mergeConfigs } from '../../src/config/configLoad.js';
import { pack } from '../../src/core/packager.js';
import { searchFiles } from '../../src/core/file/fileSearch.js';
import { createTempDir, removeTempDir } from '../testing/testUtils.js';

describe('packager integration', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await removeTempDir(tempDir);
  });

  test('should handle file paths correctly', async () => {
    // Create test files
    const testFiles = {
      'file1.txt': 'content1',
      'dir/file2.txt': 'content2',
      'dir/subdir/file3.txt': 'content3'
    };

    // Create files with absolute paths
    for (const [filePath, content] of Object.entries(testFiles)) {
      const fullPath = path.resolve(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }

    // Create config with relative patterns
    const config = mergeConfigs(tempDir, {
      patterns: ['**/*'],
      ignore: {
        useGitignore: false,
        useDefaultPatterns: false,
        customPatterns: []
      },
      cwd: tempDir,
      output: {
        filePath: path.join(tempDir, 'output.txt'),
        style: 'plain',
        removeComments: false,
        removeEmptyLines: false,
        topFilesLength: 5,
        showLineNumbers: false,
        copyToClipboard: false
      }
    }, {});

    const result = await pack(tempDir, config);

    expect(result.totalFiles).toBe(3);
    expect(result.totalCharacters).toBeGreaterThan(0);
    expect(result.totalTokens).toBeGreaterThan(0);

    // Verify file paths are absolute
    const expectedFiles = [
      path.join(tempDir, 'file1.txt'), 
      path.join(tempDir, 'dir', 'file2.txt'), 
      path.join(tempDir, 'dir', 'subdir', 'file3.txt')
    ];
    expect(Object.keys(result.fileCharCounts).sort()).toEqual(expectedFiles.sort());
  });

  test('should respect ignore patterns', async () => {
    // Create test files including some to be ignored
    await fs.writeFile(path.resolve(tempDir, '.gitignore'), 'ignored/\n*.log');
    await fs.mkdir(path.resolve(tempDir, 'ignored'), { recursive: true });
    await fs.writeFile(path.resolve(tempDir, 'ignored/file.txt'), 'ignored');
    await fs.writeFile(path.resolve(tempDir, 'test.log'), 'ignored');
    await fs.writeFile(path.resolve(tempDir, 'keep.txt'), 'kept');

    // Create config with ignore patterns and relative patterns
    const config = mergeConfigs(tempDir, {
      patterns: ['**/*'],
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
        customPatterns: []
      },
      cwd: tempDir,
      output: {
        filePath: path.join(tempDir, 'output.txt'),
        style: 'plain',
        removeComments: false,
        removeEmptyLines: false,
        topFilesLength: 5,
        showLineNumbers: false,
        copyToClipboard: false
      }
    }, {});

    const result = await pack(tempDir, config);
    expect(result.totalFiles).toBe(1); // Only keep.txt should be included
    expect(Object.keys(result.fileCharCounts)).toEqual([path.join(tempDir, 'keep.txt')]);
  });
});

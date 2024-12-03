import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pack } from '../../src/core/packager';
import * as fs from 'fs/promises';
import * as path from 'path';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import type { repofmConfigMerged } from '../../src/config/configSchema';

describe('packager integration', () => {
  let testDir: string;

  // Helper function to create test files
  async function createTestFile(relativePath: string, content: string) {
    const fullPath = path.join(testDir, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content);
    return fullPath;
  }

  beforeEach(async () => {
    // Create a temporary directory for test files
    testDir = await mkdtemp(path.join(tmpdir(), 'packager-test-'));
    console.log('Test Directory:', testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  it('should handle file paths correctly', async () => {
    // Create test files
    await createTestFile('file1.txt', 'content1');
    await createTestFile('dir/file2.txt', 'content2');
    await createTestFile('dir/subdir/file3.txt', 'content3');

    // List all files in the test directory
    const files = await fs.readdir(testDir, { recursive: true, withFileTypes: true });
    console.log('Test Files:', files);

    const config: repofmConfigMerged = {
      ignore: {
        useGitignore: false,
        useDefaultPatterns: false,
        patterns: []
      },
      security: {
        enableSecurityCheck: false
      },
      output: {
        filePath: '',
        copyToClipboard: false
      }
    };

    const result = await pack(testDir, config);

    console.log('Pack Result:', result);

    expect(result.totalFiles).toBe(3);
    expect(result.fileCharCounts[path.join(testDir, 'file1.txt')]).toBe(8);
    expect(result.fileCharCounts[path.join(testDir, 'dir/file2.txt')]).toBe(8);
    expect(result.fileCharCounts[path.join(testDir, 'dir/subdir/file3.txt')]).toBe(8);
  });

  it('should respect ignore patterns', async () => {
    // Create test files
    await createTestFile('keep.txt', 'keep this');
    await createTestFile('ignore.test.ts', 'ignore this');
    await createTestFile('node_modules/pkg/file.js', 'ignore this too');

    // List all files in the test directory
    const files = await fs.readdir(testDir, { recursive: true, withFileTypes: true });
    console.log('Test Files:', files);

    const config: repofmConfigMerged = {
      ignore: {
        useGitignore: false,
        useDefaultPatterns: false,
        patterns: [
          '**/*.test.ts',
          '**/node_modules/**'
        ]
      },
      security: {
        enableSecurityCheck: false
      },
      output: {
        filePath: '',
        copyToClipboard: false
      }
    };

    const result = await pack(testDir, config);

    console.log('Pack Result:', result);

    expect(result.totalFiles).toBe(1);
    expect(result.fileCharCounts[path.join(testDir, 'keep.txt')]).toBe(9);
    expect(result.fileCharCounts[path.join(testDir, 'ignore.test.ts')]).toBeUndefined();
    expect(result.fileCharCounts[path.join(testDir, 'node_modules/pkg/file.js')]).toBeUndefined();
  });
});

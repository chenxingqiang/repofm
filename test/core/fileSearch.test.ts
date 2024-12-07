import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { searchFiles } from '../../src/core/fileSearch.js';
import type { Config } from '../../src/types/config.js';

describe('searchFiles', () => {
  const testDir = path.join(__dirname, 'test_files');
  
  const baseConfig: Config = {
    include: ['**/*'],
    ignore: {
      excludePatterns: []
    }
  };

  beforeEach(async () => {
    // Setup test directory with sample files
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, 'file1.txt'), 'content');
    await fs.writeFile(path.join(testDir, 'file2.js'), 'code');
    await fs.mkdir(path.join(testDir, 'subdir'));
    await fs.writeFile(path.join(testDir, 'subdir', 'file3.ts'), 'typescript');
  });

  it('should find all files when no filters are applied', async () => {
    const files = await searchFiles(testDir, baseConfig);
    expect(files).toHaveLength(3);
    expect(files).toContain(path.join(testDir, 'file1.txt'));
    expect(files).toContain(path.join(testDir, 'file2.js'));
    expect(files).toContain(path.join(testDir, 'subdir', 'file3.ts'));
  });

  it('should filter files based on include patterns', async () => {
    const config: Config = {
      ...baseConfig,
      include: ['**/*.ts', '**/*.js']
    };
    const files = await searchFiles(testDir, config);
    expect(files).toHaveLength(2);
    expect(files).toContain(path.join(testDir, 'file2.js'));
    expect(files).toContain(path.join(testDir, 'subdir', 'file3.ts'));
  });

  it('should exclude files based on exclude patterns', async () => {
    const config: Config = {
      ...baseConfig,
      ignore: {
        excludePatterns: ['**/file2.js']
      }
    };
    const files = await searchFiles(testDir, config);
    expect(files).toHaveLength(2);
    expect(files).toContain(path.join(testDir, 'file1.txt'));
    expect(files).toContain(path.join(testDir, 'subdir', 'file3.ts'));
  });

  // Clean up after tests
  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
});

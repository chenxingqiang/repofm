import * as fs from 'node:fs/promises';
import path from 'node:path';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultAction.js';
import { globby } from 'globby';
import { logger } from '../../../src/shared/logger.js';
import type { Config } from '../../../src/types/config.js';

// Mock the dependencies
vi.mock('globby');
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    writeFile: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn()
  };
});
vi.mock('../../../src/shared/logger.js');
vi.mock('../../../src/config/configLoad.js', () => ({
  loadConfig: vi.fn()
}));

describe('defaultAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock successful globby response
    vi.mocked(globby).mockResolvedValue(['file1.txt', 'file2.txt']);

    // Mock successful file operations
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('file content');

    // Mock fs.stat to return file size
    vi.mocked(fs.stat).mockResolvedValue({
      size: 100,
      isFile: () => true,
      isDirectory: () => false
    } as any);
  });

  it('should run the default command successfully', async () => {
    const mockConfig: Config = {
      include: [],
      ignore: {
        customPatterns: [],
        useDefaultPatterns: true,
        useGitignore: true
      },
      output: {
        filePath: 'output.txt',
        style: 'plain',
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        topFilesLength: 10
      },
      security: {
        enableSecurityCheck: true
      }
    };

    // Mock config loading
    const { loadConfig } = await import('../../../src/config/configLoad.js');
    vi.mocked(loadConfig).mockResolvedValue(mockConfig);

    // Use current working directory as target directory
    const targetDir = process.cwd();
    const configPath = './repofm.config.json';

    const options = {
      copyToClipboard: false,
      outputPath: 'output.txt',
      verbose: false
    };

    await runDefaultAction(targetDir, configPath, options);

    // Verify globby was called with expected parameters
    expect(globby).toHaveBeenCalledWith(
      ['**/*'],
      expect.objectContaining({
        cwd: process.cwd(),
        absolute: false,
        dot: false,
        followSymbolicLinks: false,
        gitignore: true,
        onlyFiles: true
      })
    );

    // Verify file write operation
    expect(fs.writeFile).toHaveBeenCalled();

    // Verify logger was called
    expect(logger.info).toHaveBeenCalled();
  });
});

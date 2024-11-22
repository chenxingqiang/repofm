import { vi, describe, it, expect, beforeEach } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultAction.js';
import { globby } from 'globby';
import * as fs from 'fs/promises';
import { logger } from '../../../src/utils/logger.js';
import type { Config } from '../../../src/types/config.js';

// Mock the dependencies
vi.mock('globby');
vi.mock('fs/promises');
vi.mock('../../../src/utils/logger.js');

describe('defaultAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock successful globby response
    vi.mocked(globby).mockResolvedValue(['file1.txt', 'file2.txt']);

    // Mock successful file operations
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('file content');
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

    const options = {
      cwd: process.cwd(),
      config: mockConfig
    };

    await runDefaultAction(options);

    expect(globby).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        dot: false,
        followSymlinks: true
      })
    );

    expect(fs.writeFile).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  // Add more test cases as needed...
});

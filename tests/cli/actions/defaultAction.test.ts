import * as fs from 'node:fs/promises';
import path from 'node:path';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultAction.js';
import { logger } from '../../../src/shared/logger.js';
import type { Config } from '../../../src/types/config.js';
import * as core from '../../../src/core/index.js';

// Mock the dependencies
vi.mock('node:fs/promises', async () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn()
}));

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    setVerbose: vi.fn()
  }
}));

vi.mock('../../../src/core/index.js', () => ({
  processDirectory: vi.fn()
}));

vi.mock('clipboardy', () => ({
  write: vi.fn()
}));

vi.mock('jschardet', () => ({
  detect: vi.fn().mockReturnValue({ 
    encoding: 'utf-8', 
    confidence: 1.0 
  })
}));

vi.mock('iconv-lite', () => ({
  decode: vi.fn().mockReturnValue('mocked file content')
}));

vi.mock('istextorbinary', () => ({
  isBinary: vi.fn().mockReturnValue(false)
}));

describe('defaultAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful processDirectory response
    vi.mocked(core.processDirectory).mockResolvedValue('mock result');

    // Mock successful file operations
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue('file content');
    (fs.stat as jest.Mock).mockResolvedValue({
      size: 100,
      isFile: () => true,
      isDirectory: () => false
    });
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

    const result = await runDefaultAction({
      config: mockConfig,
      workingDir: '/test/dir'
    });

    expect(result).toBe(true);
    expect(core.processDirectory).toHaveBeenCalledWith('/test/dir', mockConfig);
    expect(fs.writeFile).toHaveBeenCalledWith('output.txt', 'mock result', 'utf-8');
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    // Mock processDirectory to throw an error
    vi.mocked(core.processDirectory).mockRejectedValue(new Error('Process error'));

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

    const result = await runDefaultAction({
      config: mockConfig,
      workingDir: '/test/dir'
    });

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalled();
  });
});

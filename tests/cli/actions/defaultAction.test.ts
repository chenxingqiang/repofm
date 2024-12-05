import { describe, test, expect, vi, beforeEach } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultAction.js';
import * as packager from '../../../src/core/packager.js';
import { loadConfig } from '../../../src/config/configLoad.js';
import { createTestConfig } from '../../../src/test/helpers.js';

// Mock the packager module
vi.mock('../../../src/core/packager.js', () => ({
  pack: vi.fn(),
  generateOutput: vi.fn()
}));

vi.mock('../../../src/config/configLoad.js', () => ({
  loadConfig: vi.fn(),
  createDefaultConfig: vi.fn()
}));

describe('Default Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('runs default action successfully', async () => {
    const mockCwd = '/mock/path';
    const mockLoadedConfig = createTestConfig({
      output: {
        filePath: 'custom_output.txt',
        style: 'plain',
        removeComments: false,
        removeEmptyLines: false,
        topFilesLength: 5,
        showLineNumbers: false,
        copyToClipboard: false,
        headerText: 'Test Header',
        instructionFilePath: 'instructions.md'
      },
      include: ['src/**'],
      ignore: {
        customPatterns: ['test/**'],
        useDefaultPatterns: true,
        useGitignore: true,
        excludePatterns: ['node_modules/**']
      },
      security: { enableSecurityCheck: true }
    });

    vi.mocked(loadConfig).mockResolvedValue(mockLoadedConfig);
    vi.mocked(packager.pack).mockResolvedValue({
      totalFiles: 5,
      fileCharCounts: { 'src/index.ts': 100, 'src/utils.ts': 200 },
      output: 'Mock output content'
    });

    const result = await runDefaultAction(mockCwd, { copy: true, security: true });

    expect(loadConfig).toHaveBeenCalledWith(mockCwd);
    expect(packager.pack).toHaveBeenCalledWith(
      mockCwd, 
      expect.objectContaining({
        cwd: mockCwd,
        output: expect.objectContaining({
          filePath: 'custom_output.txt',
          copyToClipboard: true
        }),
        include: expect.arrayContaining(['src/**']),
        ignore: expect.objectContaining({
          customPatterns: expect.arrayContaining(['test/**'])
        }),
        security: { enableSecurityCheck: true }
      })
    );
    expect(result).toBe(true);
  });

  test('handles no files scenario with default config', async () => {
    const mockCwd = '/mock/path';
    const mockLoadedConfig = createTestConfig();

    vi.mocked(loadConfig).mockResolvedValue(mockLoadedConfig);
    vi.mocked(packager.pack).mockResolvedValue({
      totalFiles: 0,
      fileCharCounts: {},
      output: ''
    });

    const result = await runDefaultAction(mockCwd);

    expect(loadConfig).toHaveBeenCalledWith(mockCwd);
    expect(packager.pack).toHaveBeenCalledWith(
      mockCwd, 
      expect.objectContaining({
        cwd: mockCwd,
        output: expect.objectContaining({
          filePath: 'output.txt',
          copyToClipboard: false
        }),
        include: [],
        ignore: expect.objectContaining({
          useDefaultPatterns: true,
          useGitignore: true,
          excludePatterns: expect.arrayContaining(['node_modules/**', '.git/**'])
        }),
        security: { enableSecurityCheck: false }
      })
    );
    expect(result).toBe(false);
  });
});

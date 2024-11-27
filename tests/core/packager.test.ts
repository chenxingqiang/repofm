import { beforeEach, describe, expect, test, vi } from 'vitest';
import { pack } from '../../src/core/packager.js';
import { createMockConfig } from '../testing/testUtils.js';
import type { FileInfo } from '../../src/core/types.js';
import type { repofmConfigMerged } from '../../src/config/configSchema.js';

describe('packager', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic functionality', () => {
    test('pack should process files and generate output', async () => {
      const mockFiles = [
        { path: 'test.txt', content: 'test content', size: 0 }
      ];

      const mockDeps = {
        searchFiles: vi.fn().mockResolvedValue(['test.txt']),
        collectFiles: vi.fn().mockResolvedValue(mockFiles),
        processFiles: vi.fn().mockResolvedValue(mockFiles),
        runSecurityCheck: vi.fn().mockResolvedValue([]),
        generateOutput: vi.fn().mockResolvedValue('output'),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        countTokens: vi.fn().mockResolvedValue(5),
      };

      const config: repofmConfigMerged = {
        cwd: process.cwd(),
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: '',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        },
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
        security: {
          enableSecurityCheck: true,
        },
        include: [],
      };

      const result = await pack('test-dir', config, undefined, mockDeps);

      expect(result.totalFiles).toBe(1);
      expect(mockDeps.searchFiles).toHaveBeenCalled();
      expect(mockDeps.collectFiles).toHaveBeenCalled();
      expect(mockDeps.processFiles).toHaveBeenCalled();
      expect(mockDeps.generateOutput).toHaveBeenCalled();
    });

    // ... other tests with similar mock setup
  });
});

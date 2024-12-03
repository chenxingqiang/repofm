import { beforeEach, describe, expect, test, vi } from 'vitest';
import { pack, generateOutput } from '../../src/core/packager.js';
import { createTestConfig } from '../../src/test/helpers.js';

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
        runSecurityCheck: vi.fn().mockResolvedValue(mockFiles),
        generateOutput: vi.fn().mockReturnValue('output')
      };

      const config = createTestConfig({
        cwd: '/test/dir',
        ignore: {
          excludePatterns: ['node_modules/**'],
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: []
        }
      });

      const result = await pack('test-dir', config, mockDeps);

      expect(result.totalFiles).toBe(1);
      expect(mockDeps.searchFiles).toHaveBeenCalled();
      expect(mockDeps.collectFiles).toHaveBeenCalled();
      expect(mockDeps.processFiles).toHaveBeenCalled();
    });
  });

  describe('generateOutput', () => {
    test('should generate JSON output', () => {
      const data = { test: 'value' };
      const result = generateOutput({ data, format: 'json' });
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    test('should generate text output', () => {
      const data = 'test string';
      const result = generateOutput({ data, format: 'text' });
      expect(result).toBe(data);
    });

    test('should generate markdown output', () => {
      const data = { test: 'value' };
      const result = generateOutput({ data, format: 'markdown' });
      expect(result).toContain('```json');
    });
  });

  describe('Error handling', () => {
    test('should propagate and log errors', async () => {
      const mockError = new Error('Test error');
      const mockDeps = {
        searchFiles: vi.fn().mockRejectedValue(mockError),
        collectFiles: vi.fn(),
        processFiles: vi.fn(),
        runSecurityCheck: vi.fn(),
        generateOutput: vi.fn()
      };

      const consoleSpy = vi.spyOn(console, 'error');
      
      await expect(pack('test-dir', createTestConfig(), mockDeps))
        .rejects.toThrow(mockError);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error during file processing:', mockError);
    });
  });

  describe('Security check handling', () => {
    test('should skip security check when disabled', async () => {
      const mockFiles = [{ path: 'test.txt', content: 'test', size: null }];
      const mockDeps = {
        searchFiles: vi.fn().mockResolvedValue(['test.txt']),
        collectFiles: vi.fn().mockResolvedValue(mockFiles),
        processFiles: vi.fn().mockResolvedValue(mockFiles),
        runSecurityCheck: vi.fn(),
        generateOutput: vi.fn().mockReturnValue('output')
      };

      const config = createTestConfig({ security: { enableSecurityCheck: false } });
      await pack('test-dir', config, mockDeps);

      expect(mockDeps.runSecurityCheck).not.toHaveBeenCalled();
    });
  });
});

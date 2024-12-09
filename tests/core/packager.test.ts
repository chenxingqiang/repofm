import { jest, beforeEach, describe, expect, test } from '@jest/globals';
import { pack, generateOutput } from '../../src/core/packager.js';
import { createTestConfig } from '../../src/test/helpers.js';

describe('packager', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Basic functionality', () => {
    test('pack should process files and generate output', async () => {
      const mockFiles = [
        { path: 'test.txt', content: 'test content', size: 0 }
      ];

      const mockDeps = {
        searchFiles: jest.fn().mockResolvedValue(['test.txt']),
        collectFiles: jest.fn().mockResolvedValue(mockFiles),
        processFiles: jest.fn().mockResolvedValue(mockFiles),
        runSecurityCheck: jest.fn().mockResolvedValue(mockFiles),
        generateOutput: jest.fn().mockReturnValue('output')
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
        searchFiles: jest.fn().mockRejectedValue(mockError),
        collectFiles: jest.fn(),
        processFiles: jest.fn(),
        runSecurityCheck: jest.fn(),
        generateOutput: jest.fn()
      };

      const consoleSpy = jest.spyOn(console, 'error');
      
      await expect(pack('test-dir', createTestConfig(), mockDeps))
        .rejects.toThrow(mockError);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error during file processing:', mockError);
    });
  });

  describe('Security check handling', () => {
    test('should skip security check when disabled', async () => {
      const mockFiles = [{ path: 'test.txt', content: 'test', size: null }];
      const mockDeps = {
        searchFiles: jest.fn().mockResolvedValue(['test.txt']),
        collectFiles: jest.fn().mockResolvedValue(mockFiles),
        processFiles: jest.fn().mockResolvedValue(mockFiles),
        runSecurityCheck: jest.fn(),
        generateOutput: jest.fn().mockReturnValue('output')
      };

      const config = createTestConfig({ security: { enableSecurityCheck: false } });
      await pack('test-dir', config, mockDeps);

      expect(mockDeps.runSecurityCheck).not.toHaveBeenCalled();
    });
  });
});

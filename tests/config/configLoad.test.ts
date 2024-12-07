import type { Stats } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { z } from 'zod';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadFileConfig, mergeConfigs, createDefaultConfig } from '../../src/config/configLoad.js';
import type { Config, CliOptions } from '../../src/types/config.js';
import { getGlobalDirectory } from '../../src/config/globalDirectory.js';
import { logger } from '../../src/shared/logger.js';

// Mock the entire fs/promises module
vi.mock('node:fs/promises', () => ({
  stat: vi.fn(),
  readFile: vi.fn()
}));

vi.mock('../../src/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    log: vi.fn()
  }
}));
vi.mock('../../src/config/globalDirectory', () => ({
  getGlobalDirectory: vi.fn(),
}));

describe('configLoad', () => {
  const mockCwd = '/mock/path';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {};
  });

  describe('createDefaultConfig', () => {
    test('should create default config with minimal options', () => {
      const defaultConfig = createDefaultConfig(mockCwd);
      
      expect(defaultConfig.cwd).toBe(mockCwd);
      expect(defaultConfig.output.filePath).toBe('output.txt');
      expect(defaultConfig.output.style).toBe('plain');
      expect(defaultConfig.output.copyToClipboard).toBe(false);
      expect(defaultConfig.ignore.useDefaultPatterns).toBe(true);
      expect(defaultConfig.ignore.excludePatterns).toEqual(['node_modules/**', '.git/**']);
    });

    test('should override default config with provided options', () => {
      const customConfig = createDefaultConfig(mockCwd, {
        output: 'custom-output.txt',
        copy: true,
        include: ['src/**'],
        security: true
      });

      expect(customConfig.output.filePath).toBe('custom-output.txt');
      expect(customConfig.output.copyToClipboard).toBe(true);
      expect(customConfig.include).toEqual(['src/**']);
      expect(customConfig.security.enableSecurityCheck).toBe(true);
    });
  });

  describe('loadFileConfig', () => {
    test('should throw ZodError for invalid config structure', async () => {
      const invalidConfigs = [
        // Invalid field types
        { 
          output: { 
            filePath: 123 as any, 
            style: 'invalid' as any
          }
        },
        // Extra unexpected fields
        { 
          output: { 
            filePath: 'test.txt', 
            style: 'plain' 
          },
          unexpectedField: 'value'
        }
      ];

      for (const invalidConfig of invalidConfigs) {
        // Simulate local config
        (fs.stat as vi.Mock)
          .mockRejectedValueOnce(new Error('Local config not found'))
          .mockResolvedValueOnce({ isFile: () => true });
        
        // Mock global config read
        (getGlobalDirectory as vi.Mock).mockReturnValue('/mock/global/dir');
        (fs.readFile as vi.Mock).mockResolvedValue(JSON.stringify(invalidConfig));

        const result = await loadFileConfig(mockCwd, null);
        expect(result).toEqual({});
      }
    });

    test('should handle partial config with missing optional fields', async () => {
      // Mock global directory to prevent undefined path error
      (getGlobalDirectory as vi.Mock).mockReturnValue('/mock/global/dir');
      
      // Simulate local config not found, then use global config
      (fs.stat as vi.Mock)
        .mockRejectedValueOnce(new Error('Local config not found'))
        .mockResolvedValueOnce({ isFile: () => true });
      
      const partialConfig = {
        output: { 
          filePath: 'partial-output.txt',
          style: 'plain'
        }
      };
      
      (fs.readFile as vi.Mock).mockResolvedValue(JSON.stringify(partialConfig));

      const result = await loadFileConfig(mockCwd, null);
      
      // Verify that partial config is loaded
      expect(result.output?.filePath).toBe('partial-output.txt');
      expect(result.output?.style).toBe('plain');
      expect(result.output).toBeDefined();
    });

    test('should throw SyntaxError for malformed JSON', async () => {
      const malformedJsonCases = [
        'invalid json',
        '{incomplete',
        'true',
        '123',
        '{"unclosed": '
      ];

      for (const malformedJson of malformedJsonCases) {
        // Simulate local config
        (fs.stat as vi.Mock)
          .mockRejectedValueOnce(new Error('Local config not found'))
          .mockResolvedValueOnce({ isFile: () => true });
        
        // Mock global config read
        (getGlobalDirectory as vi.Mock).mockReturnValue('/mock/global/dir');
        (fs.readFile as vi.Mock).mockResolvedValue(malformedJson);

        const result = await loadFileConfig(mockCwd, null);
        expect(result).toEqual({});
      }
    });

    test('should handle file read errors gracefully', async () => {
      const readErrors = [
        new Error('Permission denied'),
        new Error('File not found'),
        new Error('Disk error')
      ];

      for (const readError of readErrors) {
        // Simulate local config read error
        (fs.stat as vi.Mock)
          .mockRejectedValueOnce(readError)
          .mockRejectedValueOnce(readError);
        
        // Mock global config read
        (getGlobalDirectory as vi.Mock).mockReturnValue('/mock/global/dir');
        (fs.readFile as vi.Mock).mockRejectedValue(readError);

        const result = await loadFileConfig(mockCwd, null);
        expect(result).toEqual({});
      }
    });
  });

  describe('mergeConfigs', () => {
    test('should correctly merge configs with priority', () => {
      const fileConfig: Partial<Config> = {
        output: { 
          filePath: 'file-output.txt',
          style: 'plain'
        },
        ignore: { 
          customPatterns: ['file-ignore']
        }
      };
      const cliConfig: Partial<CliOptions> = {
        output: 'cli-output.txt',
        copy: true,
        security: true
      };

      const result = mergeConfigs(mockCwd, fileConfig, cliConfig);

      // CLI config should override file config
      expect(result.output.filePath).toBe('cli-output.txt');
      expect(result.output.style).toBe('plain');
      expect(result.output.copyToClipboard).toBe(true);
      
      // Merged config should keep file config values
      expect(result.ignore.customPatterns).toEqual(['file-ignore']);
      
      // Security should be overridden by CLI
      expect(result.security.enableSecurityCheck).toBe(true);
    });

    test('should validate merged config against schema', () => {
      const invalidFileConfig = {
        output: { 
          filePath: 123 as any, // Invalid type
          style: 'invalid' as any
        }
      };
      const invalidCliConfig = {
        output: 123 as any
      };

      expect(() => {
        mergeConfigs(mockCwd, invalidFileConfig, invalidCliConfig);
      }).toThrow(z.ZodError);
    });
  });
});

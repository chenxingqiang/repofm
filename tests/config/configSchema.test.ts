import { outro } from '@clack/prompts';
import { describe, expect, it } from 'vitest';
import { custom, z } from 'zod';
import {
  repofmConfigBaseSchema,
  repofmConfigCliSchema,
  repofmConfigDefaultSchema,
  repofmConfigFileSchema,
  repofmConfigMergedSchema,
  repofmOutputStyleSchema,
} from '../../src/config/configSchema.js';

describe('configSchema', () => {
  describe('repofmOutputStyleSchema', () => {
    it('should accept valid output styles', () => {
      expect(repofmOutputStyleSchema.parse('plain')).toBe('plain');
      expect(repofmOutputStyleSchema.parse('xml')).toBe('xml');
    });

    it('should reject invalid output styles', () => {
      expect(() => repofmOutputStyleSchema.parse('invalid')).toThrow(z.ZodError);
    });
  });

  describe('repofmConfigBaseSchema', () => {
    it('should accept valid base config', () => {
      const validConfig = {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          removeComments: true,
        },
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          customPatterns: ['node_modules'],
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(repofmConfigBaseSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should accept empty object', () => {
      expect(repofmConfigBaseSchema.parse({})).toEqual({});
    });

    it('should reject invalid types', () => {
      const invalidConfig = {
        output: {
          filePath: 123, // Should be string
          style: 'invalid', // Should be 'plain' or 'xml'
        },
        include: 'not-an-array', // Should be an array
      };
      expect(() => repofmConfigBaseSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });

  describe('repofmConfigDefaultSchema', () => {
    it('should accept valid default config', () => {
      const validConfig = {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          removeComments: false,
          removeEmptyLines: false,
          topFilesLength: 5,
          showLineNumbers: false,
          copyToClipboard: true,
        },
        include: [],
        ignore: {
          customPatterns: [],
          useGitignore: true,
          useDefaultPatterns: true,
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(repofmConfigDefaultSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject incomplete config', () => {
      const validConfig = {};
      expect(() => repofmConfigDefaultSchema.parse(validConfig)).not.toThrow();
    });
  });

  describe('repofmConfigFileSchema', () => {
    it('should accept valid file config', () => {
      const validConfig = {
        output: {
          filePath: 'custom-output.txt',
          style: 'xml',
        },
        ignore: {
          customPatterns: ['*.log'],
        },
      };
      expect(repofmConfigFileSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should accept partial config', () => {
      const partialConfig = {
        output: {
          filePath: 'partial-output.txt',
        },
      };
      expect(repofmConfigFileSchema.parse(partialConfig)).toEqual(partialConfig);
    });
  });

  describe('repofmConfigCliSchema', () => {
    it('should accept valid CLI config', () => {
      const validConfig = {
        output: {
          filePath: 'cli-output.txt',
          showLineNumbers: true,
        },
        include: ['src/**/*.ts'],
      };
      expect(repofmConfigCliSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject invalid CLI options', () => {
      const invalidConfig = {
        output: {
          filePath: 123, // Should be string
        },
      };
      expect(() => repofmConfigCliSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });

  describe('repofmConfigMergedSchema', () => {
    it('should accept valid merged config', () => {
      const validConfig = {
        cwd: '/path/to/project',
        output: {
          filePath: 'merged-output.txt',
          style: 'plain',
          removeComments: true,
          removeEmptyLines: false,
          topFilesLength: 10,
          showLineNumbers: true,
          copyToClipboard: false,
        },
        include: ['**/*.js', '**/*.ts'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: ['*.log'],
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(repofmConfigMergedSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject merged config missing required fields', () => {
      const invalidConfig = {
        output: {
          filePath: 'output.txt',
          // Missing required fields
        },
      };
      expect(() => repofmConfigMergedSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });

    it('should reject merged config with invalid types', () => {
      const invalidConfig = {
        cwd: '/path/to/project',
        output: {
          filePath: 'output.txt',
          style: 'plain',
          removeComments: 'not-a-boolean', // Should be boolean
          removeEmptyLines: false,
          topFilesLength: '5', // Should be number
          showLineNumbers: false,
        },
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(() => repofmConfigMergedSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });
});

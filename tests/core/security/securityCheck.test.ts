import { beforeEach, describe, expect, test, vi } from 'vitest';
import { runSecurityCheck } from '../../../src/core/security/securityCheck.js';
import type { FileInfo } from '../../../src/core/types.js';

describe('securityCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic functionality', () => {
    test('should identify suspicious files', async () => {
      const files: FileInfo[] = [
        {
          path: 'test.env',
          content: 'API_KEY=12345',
          size: 0
        },
        {
          path: 'config.json',
          content: '{"password": "secret123"}',
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        filePath: 'test.env',
        messages: ['Potential API key detected'],
        severity: 'warning'
      });
      expect(result[1]).toEqual({
        filePath: 'config.json',
        messages: ['Hardcoded password detected'],
        severity: 'medium'
      });
    });

    test('should handle empty file list', async () => {
      const result = await runSecurityCheck([]);
      expect(result).toEqual([]);
    });

    test('should handle files without sensitive data', async () => {
      const files = [
        {
          path: 'readme.md',
          content: '# Project Documentation',
          size: 0
        },
        {
          path: 'index.js',
          content: 'console.log("Hello World");',
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);
      expect(result).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    test('should handle files with null or empty content', async () => {
      const files = [
        {
          path: 'empty.txt',
          content: '',
          size: 0
        },
        {
          path: 'null.txt',
          content: null as any,
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);
      expect(result).toEqual([]);
    });

    test('should handle files with special characters in path', async () => {
      const files = [
        {
          path: 'path/with/spaces and symbols!@#$.txt',
          content: 'API_KEY=test',
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);
      expect(result).toHaveLength(1);
      expect(result[0].filePath).toBe('path/with/spaces and symbols!@#$.txt');
      expect(result[0].severity).toBe('warning');
    });

    test('should handle very large files', async () => {
      const largeContent = 'a'.repeat(1000000) + 'API_KEY=secret' + 'a'.repeat(1000000);
      const files = [
        {
          path: 'large.txt',
          content: largeContent,
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('warning');
    });
  });

  describe('Pattern detection', () => {
    test('should identify multiple issues in single file', async () => {
      const files = [
        {
          path: 'config.js',
          content: `
            const config = {
              apiKey: '1234567890',
              password: 'supersecret',
              token: 'abcdef123456'
            };
          `,
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);

      expect(result).toHaveLength(1);
      expect(result[0].messages).toContain('Potential API key/secret detected');
      expect(result[0].messages).toContain('Hardcoded password detected');
      expect(result[0].messages).toContain('Sensitive information detected');
      expect(result[0].severity).toBe('medium');
    });

    test('should detect various secret patterns', async () => {
      const files = [
        {
          path: 'secrets.txt',
          content: [
            'API_KEY=abc123',
            'api-key: def456',
            'SECRET_TOKEN=ghi789',
            'password="jkl012"',
            'aws_access_key_id=mno345',
            'private_key="pqr678"',
          ].join('\n'),
          size: 0
        },
      ];

      const result = await runSecurityCheck(files);
      expect(result).toHaveLength(1);
      expect(result[0].messages).toContain('Potential API key detected');
      expect(result[0].messages).toContain('Hardcoded password detected');
      expect(result[0].messages).toContain('AWS access key detected');
      expect(result[0].messages).toContain('Private key detected');
      expect(result[0].severity).toBe('high');
    });
  });
});

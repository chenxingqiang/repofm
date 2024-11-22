import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOutput, buildOutputGeneratorContext } from '../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../testing/testUtils.js';
import { repofmError } from '../../../src/shared/errorHandle.js';
import type { ProcessedFile } from '../../../src/core/file/fileTypes.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';

describe('outputGenerate', () => {
  test('generateOutput should write correct content to file', async () => {
    const mockConfig = createMockConfig({}, {
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      }
    });

    const mockProcessedFiles: ProcessedFile[] = [
      { path: 'file1.txt', content: 'content1', size: 0 },
      { path: 'dir/file2.txt', content: 'content2', size: 0 }
    ];

    const output = await generateOutput(process.cwd(), mockConfig, mockProcessedFiles, []);

    expect(output).toContain('File Summary');
    expect(output).toContain('File: file1.txt');
    expect(output).toContain('content1');
    expect(output).toContain('File: dir/file2.txt');
    expect(output).toContain('content2');
  });

  describe('Basic Output Generation', () => {
    test('should generate plain text output', async () => {
      const config = createMockConfig({}, {
        output: { style: 'plain' }
      });
      const files = [{ path: 'test.txt', content: 'test content', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('test content');
    });

    test('should generate XML output', async () => {
      const config = createMockConfig({}, {
        output: { style: 'xml' }
      });
      const files = [{ path: 'test.txt', content: 'test content', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('<file path="test.txt">');
    });

    test('should generate markdown output', async () => {
      const config = createMockConfig({}, {
        output: { style: 'markdown' }
      });
      const files = [{ path: 'test.js', content: 'test content', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('```javascript');
    });
  });

  describe('Header and Instructions', () => {
    test('should include custom header text', async () => {
      const config = createMockConfig({}, {
        output: { headerText: 'Custom Header' }
      });
      const files = [{ path: 'test.txt', content: 'content', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('Custom Header');
    });

    test('should include instruction file content', async () => {
      const config = createMockConfig({}, {
        output: { instructionFilePath: 'instructions.txt' }
      });
      vi.spyOn(fs, 'readFile').mockResolvedValue('Test Instructions');
      const files = [{ path: 'test.txt', content: 'content', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('Custom Instructions');
    });

    test('should handle missing instruction file', async () => {
      const config = createMockConfig({}, {
        output: { instructionFilePath: 'missing.txt' }
      });
      vi.spyOn(fs, 'access').mockRejectedValue(new Error());
      const files = [{ path: 'file.txt', content: 'content', size: 0 }];
      await expect(generateOutput('/test/dir', config, files, []))
        .rejects.toThrow(repofmError);
    });
  });

  describe('File Content Handling', () => {
    test('should handle special characters in content', async () => {
      const config = createMockConfig({}, {});
      const files = [{ path: 'test.txt', content: '<test>&"\'', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('<test>&"\'');
    });

    test('should handle empty files', async () => {
      const config = createMockConfig({}, {});
      const files = [{ path: 'empty.txt', content: '', size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('File: empty.txt');
    });

    test('should handle large files', async () => {
      const config = createMockConfig({}, {});
      const largeContent = 'a'.repeat(10000);
      const files = [{ path: 'large.txt', content: largeContent, size: 0 }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('File: large.txt');
    });
  });

  // ... rest of the test cases ...
});

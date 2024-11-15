import process from 'node:process';
import { describe, expect, test } from 'vitest';
import type { ProcessedFile } from '../../../src/core/file/fileTypes.js';
import { generateOutput } from '../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../testing/testUtils.js';
// tests/core/output/outputGenerate.test.ts

import * as fs from 'node:fs/promises';
import { afterEach, beforeEach, it, vi } from 'vitest';
import { buildOutputGeneratorContext } from '../../../src/core/output/outputGenerate.js';
import { repofmError } from '../../../src/shared/errorHandle.js';

describe('outputGenerate', () => {
  test('generateOutput should write correct content to file', async () => {
    const mockConfig = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });
    const mockProcessedFiles: ProcessedFile[] = [
      { path: 'file1.txt', content: 'content1' },
      { path: 'dir/file2.txt', content: 'content2' },
    ];

    const output = await generateOutput(process.cwd(), mockConfig, mockProcessedFiles, []);

    expect(output).toContain('File Summary');
    expect(output).toContain('File: file1.txt');
    expect(output).toContain('content1');
    expect(output).toContain('File: dir/file2.txt');
    expect(output).toContain('content2');
  });
});




vi.mock('fs/promises');
vi.mock('node:process', () => ({
  default: {
    cwd: vi.fn(),
  },
}));

describe('outputGenerate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(process.cwd).mockReturnValue('/test/dir');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Output Generation', () => {
    it('should generate plain text output', async () => {
      const config = createMockConfig({
        output: {
          style: 'plain',
          headerText: 'Test Project',
        },
      });

      const files = [
        { path: 'file1.txt', content: 'Content 1' },
        { path: 'file2.txt', content: 'Content 2' },
      ];

      const output = await generateOutput('/test/dir', config, files, ['file1.txt', 'file2.txt']);

      expect(output).toContain('Test Project');
      expect(output).toContain('file1.txt');
      expect(output).toContain('Content 1');
      expect(output).toContain('file2.txt');
      expect(output).toContain('Content 2');
      expect(output).toContain('Repository Structure');
    });

    it('should generate XML output', async () => {
      const config = createMockConfig({
        output: {
          style: 'xml',
          headerText: 'Test Project',
        },
      });

      const files = [
        { path: 'file1.txt', content: 'Content 1' },
        { path: 'file2.txt', content: 'Content 2' },
      ];

      const output = await generateOutput('/test/dir', config, files, ['file1.txt', 'file2.txt']);

      expect(output).toContain('<?xml');
      expect(output).toContain('<file path="file1.txt">');
      expect(output).toContain('Content 1');
      expect(output).toContain('</file>');
      expect(output).toContain('<repository_structure>');
    });

    it('should generate markdown output', async () => {
      const config = createMockConfig({
        output: {
          style: 'markdown',
          headerText: 'Test Project',
        },
      });

      const files = [
        { path: 'file1.txt', content: 'Content 1' },
        { path: 'file2.txt', content: 'Content 2' },
      ];

      const output = await generateOutput('/test/dir', config, files, ['file1.txt', 'file2.txt']);

      expect(output).toContain('# File Summary');
      expect(output).toContain('## File: file1.txt');
      expect(output).toContain('```');
      expect(output).toContain('Content 1');
      expect(output).toContain('# Repository Structure');
    });
  });

  describe('Header and Instructions', () => {
    it('should include custom header text', async () => {
      const config = createMockConfig({
        output: {
          headerText: 'Custom Project Header',
        },
      });

      const files = [{ path: 'file.txt', content: 'content' }];
      const output = await generateOutput('/test/dir', config, files, ['file.txt']);

      expect(output).toContain('Custom Project Header');
    });

    it('should include instruction file content', async () => {
      const config = createMockConfig({
        output: {
          instructionFilePath: 'instructions.md',
        },
      });

      vi.mocked(fs.readFile).mockResolvedValue('Custom Instructions');

      const files = [{ path: 'file.txt', content: 'content' }];
      const output = await generateOutput('/test/dir', config, files, ['file.txt']);

      expect(output).toContain('Custom Instructions');
    });

    it('should handle missing instruction file', async () => {
      const config = createMockConfig({
        output: {
          instructionFilePath: 'missing.md',
        },
      });

      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const files = [{ path: 'file.txt', content: 'content' }];

      await expect(generateOutput('/test/dir', config, files, ['file.txt']))
        .rejects.toThrow(repofmError);
    });
  });

  describe('File Content Handling', () => {
    it('should handle special characters in content', async () => {
      const config = createMockConfig();
      const files = [{
        path: 'special.txt',
        content: '< > & " \' \n \t \r',
      }];

      const output = await generateOutput('/test/dir', config, files, ['special.txt']);

      expect(output).toContain('< > & " \' \n \t \r');
    });

    it('should handle empty files', async () => {
      const config = createMockConfig();
      const files = [{ path: 'empty.txt', content: '' }];

      const output = await generateOutput('/test/dir', config, files, ['empty.txt']);

      expect(output).toContain('empty.txt');
      expect(output).not.toContain(undefined);
    });

    it('should handle large files', async () => {
      const config = createMockConfig();
      const largeContent = 'a'.repeat(1024 * 1024); // 1MB content
      const files = [{ path: 'large.txt', content: largeContent }];

      const output = await generateOutput('/test/dir', config, files, ['large.txt']);

      expect(output).toContain('large.txt');
      expect(output).toContain(largeContent);
    });
  });

  describe('Repository Structure', () => {
    it('should generate correct structure for nested files', async () => {
      const config = createMockConfig();
      const files = [
        { path: 'src/index.js', content: 'code' },
        { path: 'src/utils/helper.js', content: 'helper' },
        { path: 'tests/test.js', content: 'test' },
      ];

      const allPaths = ['src/index.js', 'src/utils/helper.js', 'tests/test.js'];
      const output = await generateOutput('/test/dir', config, files, allPaths);

      expect(output).toContain('src/');
      expect(output).toContain('utils/');
      expect(output).toContain('tests/');
    });

    it('should handle empty directories', async () => {
      const config = createMockConfig();
      const files: any[] = [];
      const allPaths: string[] = [];

      const output = await generateOutput('/test/dir', config, files, allPaths);

      expect(output).toContain('Repository Structure');
      expect(output).not.toContain(undefined);
    });
  });

  describe('Error Handling', () => {
    it('should handle file path errors', async () => {
      const config = createMockConfig();
      const files = [{ path: '../outside.txt', content: 'content' }];

      const output = await generateOutput('/test/dir', config, files, ['../outside.txt']);

      expect(output).toContain('../outside.txt');
    });

    it('should handle invalid file paths', async () => {
      const config = createMockConfig();
      const files = [{ path: '', content: 'content' }];

      const output = await generateOutput('/test/dir', config, files, ['']);

      expect(output).toBeDefined();
      expect(output).not.toContain(undefined);
    });
  });

  describe('Context Building', () => {
    it('should build correct context with instruction file', async () => {
      const config = createMockConfig({
        output: {
          instructionFilePath: 'instructions.md',
        },
      });

      vi.mocked(fs.readFile).mockResolvedValue('Instructions Content');

      const context = await buildOutputGeneratorContext(
        '/test/dir',
        config,
        ['file.txt'],
        [{ path: 'file.txt', content: 'content' }]
      );

      expect(context.instruction).toBe('Instructions Content');
      expect(context.config).toBe(config);
      expect(context.processedFiles).toHaveLength(1);
    });

    it('should handle missing instruction file', async () => {
      const config = createMockConfig({
        output: {
          instructionFilePath: 'missing.md',
        },
      });

      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(buildOutputGeneratorContext(
        '/test/dir',
        config,
        ['file.txt'],
        [{ path: 'file.txt', content: 'content' }]
      )).rejects.toThrow(repofmError);
    });
  });

  describe('Performance', () => {
    it('should handle large number of files efficiently', async () => {
      const config = createMockConfig();
      const files = Array.from({ length: 1000 }, (_, i) => ({
        path: `file${i}.txt`,
        content: `content ${i}`,
      }));

      const allPaths = files.map(f => f.path);

      const startTime = Date.now();
      await generateOutput('/test/dir', config, files, allPaths);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle deep directory structures efficiently', async () => {
      const config = createMockConfig();
      const depth = 20;
      const files = Array.from({ length: depth }, (_, i) => ({
        path: Array(i + 1).fill('dir').join('/') + '/file.txt',
        content: 'content',
      }));

      const allPaths = files.map(f => f.path);

      const startTime = Date.now();
      await generateOutput('/test/dir', config, files, allPaths);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('File Extensions', () => {
    it('should handle various file extensions correctly in markdown', async () => {
      const config = createMockConfig({
        output: {
          style: 'markdown',
        },
      });

      const files = [
        { path: 'script.js', content: 'javascript code' },
        { path: 'style.css', content: 'css code' },
        { path: 'template.html', content: 'html code' },
        { path: 'data.json', content: 'json data' },
      ];

      const output = await generateOutput('/test/dir', config, files, files.map(f => f.path));

      expect(output).toContain('```javascript\n');
      expect(output).toContain('```css\n');
      expect(output).toContain('```html\n');
      expect(output).toContain('```json\n');
    });
  });
});

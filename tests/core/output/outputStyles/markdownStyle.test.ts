import process from 'node:process';
import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { generateOutput } from '../../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../../testing/testUtils.js';
import type { FileInfo } from '../../../../src/core/types.js';

jest.mock('fs/promises');

describe('markdownStyle', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Basic functionality', () => {
    test('should generate markdown output with basic configuration', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Basic markdown test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const files: FileInfo[] = [
        {
            path: 'file1.txt', content: 'Content 1',
            size: 10
        },
        {
            path: 'file2.txt', content: 'Content 2',
            size: 20
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['file1.txt', 'file2.txt']);

      expect(output).toMatch(/^# /); // Should start with h1
      expect(output).toContain('# File Summary');
      expect(output).toContain('# Repository Structure');
      expect(output).toContain('# Repository Files');
      expect(output).toContain('```txt\nContent 1'); // Code blocks
      expect(output).toContain('```txt\nContent 2');
    });

    test('should include user-provided header text', async () => {
      const headerText = 'Custom markdown header';
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText,
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const output = await generateOutput(process.cwd(), mockConfig, [], []);

      expect(output).toContain(headerText);
      expect(output).toMatch(/^# /); // Should start with h1
    });
  });

  describe('Content formatting', () => {
    test('should format code blocks correctly', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Code blocks test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const files: FileInfo[] = [
        {
            path: 'code.js',
            content: 'function test() {\n  return true;\n}',
            size: 30
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['code.js']);

      expect(output).toMatch(/```javascript\s*\nfunction test/); // Code block with language
      expect(output).toMatch(/}\s*\n```/); // Code block closing
    });

    test('should handle line numbers in code blocks', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Line numbers test',
          topFilesLength: 2,
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const files: FileInfo[] = [
        {
            path: 'multiline.txt', content: 'Line 1\nLine 2\nLine 3',
            size: 40
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['multiline.txt']);

      expect(output).toContain('1. Line 1');
      expect(output).toContain('2. Line 2');
      expect(output).toContain('3. Line 3');
    });

    test('should properly escape markdown special characters', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Escaping test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const files: FileInfo[] = [
        {
            path: 'special.md', content: '# Header\n* List\n> Quote\n`code`',
            size: 50
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['special.md']);

      // These characters should be escaped in the file content section
      expect(output).toContain('```markdown\n# Header');
      expect(output).toContain('* List');
      expect(output).toContain('> Quote');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty file list', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Empty test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const output = await generateOutput(process.cwd(), mockConfig, [], []);

      expect(output).toContain('# File Summary');
      expect(output).toContain('Files processed: 0');
      expect(output).toContain('# Repository Files');
      // Empty file list should not have any tree structure or code blocks
      expect(output).not.toContain('```');
    });

    test('should handle files with special characters in paths', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Special paths test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const files: FileInfo[] = [
        {
            path: 'path/with [brackets] (parens).md', content: 'Content',
            size: 60
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['path/with [brackets] (parens).md']);

      // The path should be properly escaped in the markdown output
      expect(output).toContain('## File: path/with [brackets] (parens).md');
    });

    test('should handle very large files', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: 'Large file test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
          instructionFilePath: '',
        },
      }, {});

      const largeContent = 'a'.repeat(100000);
      const files: FileInfo[] = [
        {
          path: 'large.txt',
          content: largeContent,
          size: 100000
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['large.txt']);

      expect(output).toContain('large.txt');
      expect(output).toContain('```txt\n' + largeContent); // Check for code block with content
      expect(output.length).toBeGreaterThan(100000);
    });

  });
});

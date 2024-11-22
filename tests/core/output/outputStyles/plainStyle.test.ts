import process from 'node:process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOutput } from '../../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../../testing/testUtils.js';
import type { FileInfo } from '../../../../src/core/types.js';

vi.mock('fs/promises');

describe('plainStyle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic functionality', () => {
    test('should generate plain text output with basic configuration', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Basic plain test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      }, {});

      const files: FileInfo[] = [
        { path: 'file1.txt', content: 'Content 1', size: 0 },
        { path: 'file2.txt', content: 'Content 2', size: 0 },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['file1.txt', 'file2.txt']);

      expect(output).toContain('Basic plain test');
      expect(output).toContain('File Summary');
      expect(output).toContain('Repository Structure');
      expect(output).toContain('Repository Files');
      expect(output).toContain('file1.txt');
      expect(output).toContain('file2.txt');
      expect(output).toContain('Content 1');
      expect(output).toContain('Content 2');
    });

    test('should include user-provided header text', async () => {
      const headerText = 'Custom plain text header';
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText,
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      },{});

      const output = await generateOutput(process.cwd(), mockConfig, [], []);

      expect(output).toContain(headerText);
    });
  });

  describe('Content formatting', () => {
    test('should handle line numbers when enabled', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Line numbers test',
          topFilesLength: 2,
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      },{});

      const files: FileInfo[] = [
        {
            path: 'multiline.txt', content: 'Line 1\nLine 2\nLine 3',
            size: 0
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['multiline.txt']);

      expect(output).toContain('1. Line 1');
      expect(output).toContain('2. Line 2');
      expect(output).toContain('3. Line 3');
    });

    test('should remove comments when configured', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Remove comments test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: true,
          removeEmptyLines: false,
        },
      },{});

      const files: FileInfo[] = [
        {
            path: 'code.js',
            content: '// Comment\ncode();\n/* Block comment */\nmore code();',
            size: 0
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['code.js']);

      expect(output).not.toContain('// Comment');
      expect(output).not.toContain('/* Block comment */');
      expect(output).toContain('code();\nmore code();');
    });

    test('should remove empty lines when configured', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Remove empty lines test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: true,
        },
      },{});

      const files: FileInfo[] = [
        {
            path: 'text.txt',
            content: 'Line 1\n\n\nLine 2\n\nLine 3',
            size: 0
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['text.txt']);

      const emptyLines = output.split('\n').filter(line => line.trim() === '');
      expect(emptyLines.length).toBe(0);
      expect(output).toContain('Line 1');
      expect(output).toContain('Line 2');
      expect(output).toContain('Line 3');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty file list', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Empty test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      },{});

      const output = await generateOutput(process.cwd(), mockConfig, [], []);

      expect(output).toContain('Files processed: 0');
      expect(output).toContain('Repository Files');
      expect(output).not.toMatch(/Content:/);
    });

    test('should handle files with special characters', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Special chars test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      },{});

      const files: FileInfo[] = [
        {
            path: 'path/with spaces.txt',
            content: 'Content with \t tabs and \n newlines',
            size: 0
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['path/with spaces.txt']);

      expect(output).toContain('path/with spaces.txt');
      expect(output).toContain('Content with');
      expect(output).toContain('tabs');
      expect(output).toContain('newlines');
    });

    test('should handle very large files', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Large file test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      },{});

      const largeContent = 'a'.repeat(100000);
      const files: FileInfo[] = [
        {
            path: 'large.txt', content: largeContent,
            size: 0
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['large.txt']);

      expect(output).toContain('large.txt');
      expect(output.length).toBeGreaterThan(100000);
    });

    test('should respect topFilesLength configuration', async () => {
      const mockConfig = createMockConfig({
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Top files test',
          topFilesLength: 2,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      },{});

      const files: FileInfo[] = [
        {
            path: 'file1.txt', content: 'Content 1',
            size: 0
        },
        {
            path: 'file2.txt', content: 'Content 2',
            size: 0
        },
        {
            path: 'file3.txt', content: 'Content 3',
            size: 0
        },
        {
            path: 'file4.txt', content: 'Content 4',
            size: 0
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt']);

      const fileMatches = output.match(/file\d\.txt/g) || [];
      expect(fileMatches.length).toBe(2); // Should only show top 2 files
    });
  });
});

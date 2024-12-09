import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { generateOutput } from '../../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../../testing/testUtils.js';
import type { FileInfo } from '../../../../src/core/types.js';
import { OutputConfig } from '../../../../src/types/config.js';

jest.mock('fs/promises');

describe('xmlStyle', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Basic functionality', () => {
    it('should generate valid XML output with basic configuration', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Basic XML test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

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

      expect(output).toMatch(/<\?xml version="1.0" encoding="UTF-8"\?>/);
      expect(output).toContain('<file_summary>');
      expect(output).toContain('<repository_structure>');
      expect(output).toContain('<repository_files>');
      expect(output).toContain('<file path="file1.txt">');
      expect(output).toContain('<content>Content 1</content>');
      expect(output).toContain('<file path="file2.txt">');
      expect(output).toContain('<content>Content 2</content>');
      expect(output).toContain('</file_summary>');
    });

    it('should include user-provided header text', async () => {
      const headerText = 'Custom XML header text';
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText,
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const output = await generateOutput(process.cwd(), mockConfig, [], []);

      expect(output).toContain(`<header>${headerText}</header>`);
    });
  });

  describe('Content formatting', () => {
    it('should properly escape special XML characters', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'XML escaping test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const files: FileInfo[] = [
        {
          path: 'special.txt', content: '< > & " \'',
          size: 15
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['special.txt']);

      expect(output).toContain('&lt; &gt; &amp; &quot;');
      expect(output).not.toContain('< > & "');
    });

    it('should handle line numbers when enabled', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Line numbers test',
        topFilesLength: 2,
        showLineNumbers: true,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const files: FileInfo[] = [
        {
          path: 'multiline.txt', content: 'Line 1\nLine 2\nLine 3',
          size: 25
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['multiline.txt']);

      expect(output).toContain('<line number="1">Line 1</line>');
      expect(output).toContain('<line number="2">Line 2</line>');
      expect(output).toContain('<line number="3">Line 3</line>');
    });

    it('should remove comments when configured', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Remove comments test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: true,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const files: FileInfo[] = [
        {
          path: 'code.js',
          content: '// Comment\ncode();\n/* Block comment */\nmore code();',
          size: 50
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['code.js']);

      expect(output).not.toContain('// Comment');
      expect(output).not.toContain('/* Block comment */');
      expect(output).toContain('<content>code();\nmore code();</content>');
    });

    it('should remove empty lines when configured', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Remove empty lines test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: true,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const files: FileInfo[] = [
        {
          path: 'text.txt',
          content: 'Line 1\n\n\nLine 2\n\nLine 3',
          size: 30
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['text.txt']);

      expect(output).toContain('<content>Line 1\nLine 2\nLine 3</content>');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty file list', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Empty test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const output = await generateOutput(process.cwd(), mockConfig, [], []);

      expect(output).toContain('<file_summary>');
      expect(output).toContain('<repository_structure>');
      expect(output).toContain('<files_processed>0</files_processed>');
    });

    it('should handle files with special characters in paths', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Special paths test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const files: FileInfo[] = [
        {
          path: 'path/with spaces & symbols.txt', content: 'Content',
          size: 20
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['path/with spaces & symbols.txt']);

      expect(output).toContain('<file path="path/with spaces &amp; symbols.txt">');
      expect(output).toContain('<content>Content</content>');
    });

    it('should handle very large files', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Large file test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const largeContent = 'a'.repeat(100000);
      const files: FileInfo[] = [
        {
          path: 'large.txt', content: largeContent,
          size: 100000
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['large.txt']);

      expect(output).toContain('<file path="large.txt">');
      expect(output).toContain('<content>' + largeContent + '</content>');
      expect(output.length).toBeGreaterThan(100000);
    });

    it('should respect topFilesLength configuration', async () => {
      const mockConfig: OutputConfig = {
        filePath: 'output.xml',
        style: 'xml',
        headerText: 'Top files test',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        instructionFilePath: '',
      };

      const files: FileInfo[] = [
        {
          path: 'file1.txt', content: 'Content 1',
          size: 10
        },
        {
          path: 'file2.txt', content: 'Content 2',
          size: 20
        },
        {
          path: 'file3.txt', content: 'Content 3',
          size: 30
        },
        {
          path: 'file4.txt', content: 'Content 4',
          size: 40
        },
      ];

      const output = await generateOutput(process.cwd(), mockConfig, files, ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt']);

      const fileMatches = output.match(/<file path="file\d\.txt">/g) || [];
      expect(fileMatches.length).toBe(2); // Should only show top 2 files
    });
  });
});

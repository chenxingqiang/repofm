import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOutput } from '../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../testing/testUtils.js';
import { repofmError } from '../../../src/shared/errorHandle.js';
import type { ProcessedFile } from '../../../src/core/file/fileTypes.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    access: vi.fn(),
    writeFile: vi.fn()
  }
}));

describe('outputGenerate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateOutput should write correct content to file', async () => {
    const mockConfig = createMockConfig({}, {
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
        headerText: '',
      }
    });

    const mockProcessedFiles: ProcessedFile[] = [
      { path: 'file1.txt', content: 'content1' },
      { path: 'dir/file2.txt', content: 'content2' }
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
        output: {
          style: 'plain',
          filePath: 'output.txt',
          headerText: '',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        }
      });
      const files = [{ path: 'test.txt', content: 'test content' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('test content');
    });

    test('should generate XML output', async () => {
      const config = createMockConfig({}, {
        output: {
          filePath: 'output.xml',
          style: 'xml',
          headerText: '',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        }
      });
      const files = [{ path: 'test.txt', content: 'test content' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('<file path="test.txt">');
    });

    test('should generate markdown output', async () => {
      const config = createMockConfig({}, {
        output: {
          filePath: 'output.md',
          style: 'markdown',
          headerText: '',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        }
      });
      const files = [{ path: 'test.js', content: 'test content' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('```javascript');
    });
  });

  describe('Header and Instructions', () => {
    test('should include custom header text', async () => {
      const config = createMockConfig({}, {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: 'Custom Header',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        }
      });
      const files = [{ path: 'test.txt', content: 'content' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('Custom Header');
    });

    test('should include instruction file content', async () => {
      const mockFs = await import('fs/promises');
      vi.mocked(mockFs.default.readFile).mockResolvedValue(Buffer.from('Test Instructions'));

      const config = createMockConfig({}, {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: '',
          instructionFilePath: 'instructions.txt',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        }
      });

      const files = [{ path: 'test.txt', content: 'content' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('Test Instructions');
    });

    test('should handle missing instruction file', async () => {
      const mockFs = await import('fs/promises');
      vi.mocked(mockFs.default.access).mockRejectedValue(new Error('File not found'));
      vi.mocked(mockFs.default.readFile).mockRejectedValue(new Error('File not found'));

      const config = createMockConfig({}, {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          headerText: '',
          instructionFilePath: 'missing.txt',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        }
      });

      const files = [{ path: 'file.txt', content: 'content' }];
      await expect(generateOutput('/test/dir', config, files, []))
        .rejects.toThrow(repofmError);
    });
  });

  describe('File Content Handling', () => {
    test('should handle special characters in content', async () => {
      const config = createMockConfig({}, {});
      const files = [{ path: 'test.txt', content: '<test>&"\'' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('<test>&"\'' );
    });

    test('should handle empty files', async () => {
      const config = createMockConfig({}, {});
      const files = [{ path: 'empty.txt', content: '' }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('File: empty.txt');
    });

    test('should handle large files', async () => {
      const config = createMockConfig({}, {});
      const largeContent = 'a'.repeat(10000);
      const files = [{ path: 'large.txt', content: largeContent }];
      const output = await generateOutput('/test/dir', config, files, []);
      expect(output).toContain('File: large.txt');
    });
  });

  test('should handle empty lines when configured', async () => {
    const config = createMockConfig({}, {
      output: {
        filePath: 'output.txt',
        style: 'plain',
        headerText: '',
        topFilesLength: 5,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: true,
        copyToClipboard: false,
      }
    });

    const files = [{ 
      path: 'test.txt', 
      content: 'Line 1\n\n\nLine 2\n\nLine 3' 
    }];

    const output = await generateOutput('/test/dir', config, files, []);
    const contentLines = output.split('\n').filter(line => line.trim() === '');
    expect(contentLines.length).toBe(0);
  });

  test('should respect topFilesLength configuration', async () => {
    const config = createMockConfig({}, {
      output: {
        filePath: 'output.txt',
        style: 'plain',
        headerText: '',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
        copyToClipboard: false,
      }
    });

    const files = [
      { path: 'file1.txt', content: 'Content 1' },
      { path: 'file2.txt', content: 'Content 2' },
      { path: 'file3.txt', content: 'Content 3' },
      { path: 'file4.txt', content: 'Content 4' }
    ];

    const output = await generateOutput('/test/dir', config, files.slice(0, 2), ['file1.txt', 'file2.txt']);
    const fileMatches = output.match(/File: file\d\.txt/g) || [];
    expect(fileMatches.length).toBe(2);
  });

  // ... rest of the test cases ...
});

import { describe, expect, it, vi } from 'vitest';
import { getFileManipulator } from '../../../src/core/file/fileManipulate.js';
import { processContent, processFiles } from '../../../src/core/file/fileProcess.js';
import type { RawFile } from '../../../src/core/file/fileTypes.js';
import { createMockConfig } from '../../testing/testUtils.js';

vi.mock('../../../src/core/file/fileManipulate');

describe('fileProcess', () => {
  describe('processFiles', () => {
    it('should process multiple files', async () => {
      const mockRawFiles: RawFile[] = [
        { path: 'file1.js', content: '// comment\nconst a = 1;' },
        { path: 'file2.js', content: '/* comment */\nconst b = 2;' },
      ];
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      });

      vi.mocked(getFileManipulator).mockReturnValue({
        removeComments: (content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''),
        removeEmptyLines: (content: string) => content.replace(/^\s*[\r\n]/gm, ''),
      });

      const result = await processFiles(mockRawFiles, config);

      expect(result).toEqual([
        { path: 'file1.js', content: 'const a = 1;' },
        { path: 'file2.js', content: 'const b = 2;' },
      ]);
    });
  });

  describe('processContent', () => {
    it('should remove comments and empty lines when configured', async () => {
      const content = '// comment\nconst a = 1;\n\n/* multi-line\ncomment */\nconst b = 2;';
      const filePath = 'test.js';
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      });

      vi.mocked(getFileManipulator).mockReturnValue({
        removeComments: (content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''),
        removeEmptyLines: (content: string) => content.replace(/^\s*[\r\n]/gm, ''),
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('const a = 1;\nconst b = 2;');
    });

    it('should not remove comments or empty lines when not configured', async () => {
      const content = '// comment\nconst a = 1;\n\n/* multi-line\ncomment */\nconst b = 2;';
      const filePath = 'test.js';
      const config = createMockConfig({
        output: {
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe(content.trim());
    });

    it('should handle files without a manipulator', async () => {
      const content = 'Some content';
      const filePath = 'unknown.ext';
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      });

      vi.mocked(getFileManipulator).mockReturnValue(null);

      const result = await processContent(content, filePath, config);

      expect(result).toBe(content);
    });

    it('should add line numbers when showLineNumbers is true', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const filePath = 'test.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('1: Line 1\n2: Line 2\n3: Line 3');
    });

    it('should not add line numbers when showLineNumbers is false', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const filePath = 'test.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty content when showLineNumbers is true', async () => {
      const content = '';
      const filePath = 'empty.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('1: ');
    });

    it('should pad line numbers correctly for files with many lines', async () => {
      const content = Array(100).fill('Line').join('\n');
      const filePath = 'long.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      const lines = result.split('\n');
      expect(lines[0]).toBe('  1: Line');
      expect(lines[9]).toBe(' 10: Line');
      expect(lines[99]).toBe('100: Line');
    });
  });
});





// tests/core/file/fileProcess.test.ts
import { beforeEach,  } from 'vitest';

vi.mock('../../../src/core/file/fileManipulate');
vi.mock('../../../src/shared/processConcurrency', () => ({
  getProcessConcurrency: () => 2, // Mock to return fixed concurrency for tests
}));

describe('fileProcess', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('processFiles', () => {
    it('should process multiple files concurrently', async () => {
      const mockRawFiles: RawFile[] = [
        { path: 'file1.js', content: '// comment\nconst a = 1;' },
        { path: 'file2.js', content: '/* comment */\nconst b = 2;' },
        { path: 'file3.js', content: '// another comment\nconst c = 3;' },
      ];

      const mockManipulator = {
        removeComments: vi.fn((content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')),
        removeEmptyLines: vi.fn((content: string) => content.replace(/^\s*[\r\n]/gm, '')),
      };

      vi.mocked(getFileManipulator).mockReturnValue(mockManipulator);

      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
          showLineNumbers: false,
        },
      });

      const result = await processFiles(mockRawFiles, config);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { path: 'file1.js', content: 'const a = 1;' },
        { path: 'file2.js', content: 'const b = 2;' },
        { path: 'file3.js', content: 'const c = 3;' },
      ]);

      // Verify concurrent processing
      expect(mockManipulator.removeComments).toHaveBeenCalledTimes(3);
      expect(mockManipulator.removeEmptyLines).toHaveBeenCalledTimes(3);
    });

    it('should handle files with different extensions', async () => {
      const mockRawFiles: RawFile[] = [
        { path: 'script.js', content: '// JS comment\nconst a = 1;' },
        { path: 'style.css', content: '/* CSS comment */\n.class { color: red; }' },
        { path: 'template.html', content: '<!-- HTML comment -->\n<div>content</div>' },
      ];

      const jsManipulator = {
        removeComments: vi.fn((content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')),
        removeEmptyLines: vi.fn((content: string) => content.replace(/^\s*[\r\n]/gm, '')),
      };

      const cssManipulator = {
        removeComments: vi.fn((content: string) => content.replace(/\/\*[\s\S]*?\*\//g, '')),
        removeEmptyLines: vi.fn((content: string) => content.replace(/^\s*[\r\n]/gm, '')),
      };

      const htmlManipulator = {
        removeComments: vi.fn((content: string) => content.replace(/<!--[\s\S]*?-->/g, '')),
        removeEmptyLines: vi.fn((content: string) => content.replace(/^\s*[\r\n]/gm, '')),
      };

      vi.mocked(getFileManipulator)
        .mockImplementation((filePath) => {
          if (filePath.endsWith('.js')) return jsManipulator;
          if (filePath.endsWith('.css')) return cssManipulator;
          if (filePath.endsWith('.html')) return htmlManipulator;
          return null;
        });

      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
          showLineNumbers: false,
        },
      });

      const result = await processFiles(mockRawFiles, config);

      expect(result).toHaveLength(3);
      expect(jsManipulator.removeComments).toHaveBeenCalled();
      expect(cssManipulator.removeComments).toHaveBeenCalled();
      expect(htmlManipulator.removeComments).toHaveBeenCalled();
    });
  });

  describe('processContent', () => {
    it('should add line numbers when configured', async () => {
      const content = 'line1\nline2\nline3';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, 'test.txt', config);

      expect(result).toBe('1: line1\n2: line2\n3: line3');
    });

    it('should handle large file line numbering', async () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line${i + 1}`);
      const content = lines.join('\n');
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, 'test.txt', config);
      const resultLines = result.split('\n');

      // Check padding for different line numbers
      expect(resultLines[0]).toBe('  1: line1');
      expect(resultLines[9]).toBe(' 10: line10');
      expect(resultLines[99]).toBe('100: line100');
      expect(resultLines[999]).toBe('1000: line1000');
    });

    it('should handle empty content', async () => {
      const content = '';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, 'test.txt', config);

      expect(result).toBe('1: ');
    });

    it('should process files without a manipulator', async () => {
      const content = 'test content';
      vi.mocked(getFileManipulator).mockReturnValue(null);

      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
          showLineNumbers: false,
        },
      });

      const result = await processContent(content, 'unknown.ext', config);

      expect(result).toBe('test content');
    });

    it('should handle mixed line endings', async () => {
      const content = 'line1\r\nline2\nline3\rline4';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, 'test.txt', config);

      expect(result).toBe('1: line1\r\n2: line2\n3: line3\r4: line4');
    });

    it('should handle content with empty lines', async () => {
      const content = 'line1\n\nline3\n\nline5';
      const config = createMockConfig({
        output: {
          removeEmptyLines: true,
          removeComments: false,
          showLineNumbers: true,
        },
      });

      const mockManipulator = {
        removeComments: vi.fn((str) => str),
        removeEmptyLines: vi.fn((str) => str.replace(/^\s*[\r\n]/gm, '')),
      };

      vi.mocked(getFileManipulator).mockReturnValue(mockManipulator);

      const result = await processContent(content, 'test.txt', config);
      expect(result).toBe('1: line1\n2: line3\n3: line5');
      expect(mockManipulator.removeEmptyLines).toHaveBeenCalled();
    });

    it('should process content with removal order: comments -> empty lines -> line numbers', async () => {
      const content = '// Comment\n\ncode\n\n/* Comment */\nmore code';
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
          showLineNumbers: true,
        },
      });

      const mockManipulator = {
        removeComments: vi.fn((str) => str.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')),
        removeEmptyLines: vi.fn((str) => str.replace(/^\s*[\r\n]/gm, '')),
      };

      vi.mocked(getFileManipulator).mockReturnValue(mockManipulator);

      const result = await processContent(content, 'test.js', config);

      // Verify order of operations through the final result
      expect(result).toBe('1: code\n2: more code');

      // Verify order of operations through mock calls
      const removeCommentsCalls = mockManipulator.removeComments.mock.calls;
      const removeEmptyLinesCalls = mockManipulator.removeEmptyLines.mock.calls;

      expect(removeCommentsCalls[0][0]).toBe(content); // First operation
      expect(removeEmptyLinesCalls[0][0]).toContain('code'); // Second operation, after comments removed
    });

    it('should handle invalid content gracefully', async () => {
      const content = null as any; // Simulate invalid content
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: true,
          removeEmptyLines: true,
        },
      });

      const result = await processContent(content, 'test.txt', config);

      expect(result).toBe('');
    });

    it('should process content with multiple manipulator operations', async () => {
      const content = '// Comment 1\n/* Comment 2 */\ncode\n\nmore code\n// Comment 3';
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
          showLineNumbers: true,
        },
      });

      const operations: string[] = [];
      const mockManipulator = {
        removeComments: vi.fn((str) => {
          operations.push('removeComments');
          return str.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
        }),
        removeEmptyLines: vi.fn((str) => {
          operations.push('removeEmptyLines');
          return str.replace(/^\s*[\r\n]/gm, '');
        }),
      };

      vi.mocked(getFileManipulator).mockReturnValue(mockManipulator);

      const result = await processContent(content, 'test.js', config);

      // Verify the order of operations
      expect(operations).toEqual(['removeComments', 'removeEmptyLines']);
      // Verify the final result
      expect(result).toBe('1: code\n2: more code');
    });
  });
});

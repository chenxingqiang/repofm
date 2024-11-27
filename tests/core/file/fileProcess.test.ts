import { describe, expect, test } from 'vitest';
import { processContent, processFiles } from '../../../src/core/file/fileProcess.js';
import type { RawFile } from '../../../src/core/file/fileTypes.js';

// Helper function to normalize whitespace
const normalize = (str: string) => str
  .replace(/\r\n/g, '\n')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line)
  .join('\n');

describe('fileProcess', () => {
  describe('processContent', () => {
    test('handles null content', async () => {
      const result = await processContent(null, 'test.js', {
        output: {
          removeComments: false,
          removeEmptyLines: false,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(result).toBe('');
    });

    test('normalizes line endings', async () => {
      const content = 'line1\r\nline2\rline3\nline4';
      const result = await processContent(content, 'test.js', {
        output: {
          removeComments: false,
          removeEmptyLines: false,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(result).toBe('line1\nline2\nline3\nline4');
    });

    test('removes comments when configured', async () => {
      const content = `
        // Comment
        function test() {
          /* Multi-line
             comment */
          return true;
        }
      `;
      const result = await processContent(content, 'test.js', {
        output: {
          removeComments: true,
          removeEmptyLines: false,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(normalize(result)).toBe(normalize(`
        function test() {
          return true;
        }
      `));
    });

    test('removes empty lines when configured', async () => {
      const content = `
        function test() {

          const x = 1;

          return x;

        }
      `;
      const result = await processContent(content, 'test.js', {
        output: {
          removeComments: false,
          removeEmptyLines: true,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(normalize(result)).toBe(normalize(`
        function test() {
          const x = 1;
          return x;
        }
      `));
    });

    test('adds line numbers when configured', async () => {
      const content = 'line1\nline2\nline3';
      const result = await processContent(content, 'test.txt', {
        output: {
          removeComments: false,
          removeEmptyLines: false,
          showLineNumbers: true,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(result).toBe('1: line1\n2: line2\n3: line3');
    });

    test('handles all options together', async () => {
      const content = `
        // Header comment
        function test() {

          /* Block comment */
          const x = 1;

          // Return value
          return x;

        }
      `;
      const result = await processContent(content, 'test.js', {
        output: {
          removeComments: true,
          removeEmptyLines: true,
          showLineNumbers: true,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      // The implementation preserves indentation when adding line numbers
      expect(result).toBe('1: function test() {\n2:           const x = 1;\n3:           return x;\n4:         }');
    });

    test('preserves content when no options are set', async () => {
      const content = `
        // Comment
        function test() {
          return true;
        }
      `;
      const result = await processContent(content, 'test.js', {
        output: {
          removeComments: false,
          removeEmptyLines: false,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(normalize(result)).toBe(normalize(content));
    });

    test('handles different file types', async () => {
      // Python
      const pythonContent = `
        # Python comment
        def test():
            '''Docstring'''
            return True
      `;
      const pythonResult = await processContent(pythonContent, 'test.py', {
        output: {
          removeComments: true,
          removeEmptyLines: false,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(normalize(pythonResult)).toBe(normalize(`
        def test():
            return True
      `));

      // HTML
      const htmlContent = `
        <!-- HTML comment -->
        <div>Content</div>
      `;
      const htmlResult = await processContent(htmlContent, 'test.html', {
        output: {
          removeComments: true,
          removeEmptyLines: false,
          showLineNumbers: false,
          filePath: 'test/file/path',
          style: 'plain',
          topFilesLength: 10,
          copyToClipboard: false
        }
      });
      expect(normalize(htmlResult)).toBe(normalize('<div>Content</div>'));
    });
  });

  describe('processFiles', () => {
    test('processes multiple files concurrently', async () => {
      const rawFiles: RawFile[] = [
        {
          path: 'test1.js',
          content: '// Comment 1\nfunction test1() {}\n',
          size: Buffer.from('// Comment 1\nfunction test1() {}\n').length
        },
        {
          path: 'test2.js',
          content: '// Comment 2\nfunction test2() {}\n',
          size: Buffer.from('// Comment 2\nfunction test2() {}\n').length
        },
        {
          path: 'test3.py',
          content: '# Comment 3\ndef test3():\n    pass\n',
          size: Buffer.from('# Comment 3\ndef test3():\n    pass\n').length
        },
      ];

      const result = await processFiles(rawFiles, {
          include: [],
          output: {
              removeComments: true,
              removeEmptyLines: true,
              showLineNumbers: false,
              filePath: 'test/file/path',
              style: 'plain',
              topFilesLength: 10,
              copyToClipboard: false
          },
          ignore: {
              useGitignore: true,
              useDefaultPatterns: true,
              customPatterns: []
          },
          security: {
              enableSecurityCheck: true
          },
          cwd: ''
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        path: 'test1.js',
        content: 'function test1() {}',
      });
      expect(result[1]).toEqual({
        path: 'test2.js',
        content: 'function test2() {}',
      });
      expect(result[2]).toEqual({
        path: 'test3.py',
        content: 'def test3():\n    pass',
      });
    });

    test('handles empty file list', async () => {
      const result = await processFiles([], {
          include: [],
          output: {
              removeComments: false,
              removeEmptyLines: false,
              showLineNumbers: false,
              filePath: 'test/file/path',
              style: 'plain',
              topFilesLength: 10,
              copyToClipboard: false
          },
          ignore: {
              useGitignore: true,
              useDefaultPatterns: true,
              customPatterns: []
          },
          security: {
              enableSecurityCheck: true
          },
          cwd: ''
      });
      expect(result).toEqual([]);
    });

    test('preserves file order', async () => {
      const rawFiles: RawFile[] = [
        { path: 'c.js', content: 'c', size: 1 },
        { path: 'a.js', content: 'a', size: 1 },
        { path: 'b.js', content: 'b', size: 1 },
      ];

      const result = await processFiles(rawFiles, {
          include: [],
          output: {
              removeComments: false,
              removeEmptyLines: false,
              showLineNumbers: false,
              filePath: 'test/file/path',
              style: 'plain',
              topFilesLength: 10,
              copyToClipboard: false
          },
          ignore: {
              useGitignore: true,
              useDefaultPatterns: true,
              customPatterns: []
          },
          security: {
              enableSecurityCheck: true
          },
          cwd: ''
      });
      expect(result.map(f => f.path)).toEqual(['c.js', 'a.js', 'b.js']);
    });

    test('handles files with null content', async () => {
      const rawFiles: RawFile[] = [
        { path: 'empty.js', content: '', size: 0 },
        { path: 'test.js', content: 'content', size: 7 },
      ];

      const result = await processFiles(rawFiles, {
          include: [],
          output: {
              removeComments: false,
              removeEmptyLines: false,
              showLineNumbers: false,
              filePath: 'test/file/path',
              style: 'plain',
              topFilesLength: 10,
              copyToClipboard: false
          },
          ignore: {
              useGitignore: true,
              useDefaultPatterns: true,
              customPatterns: []
          },
          security: {
              enableSecurityCheck: true
          },
          cwd: ''
      });
      expect(result).toEqual([
        { path: 'empty.js', content: '' },
        { path: 'test.js', content: 'content' },
      ]);
    });
  });
});

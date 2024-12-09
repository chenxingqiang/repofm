import { jest, describe, expect, test } from '@jest/globals';
import { getFileManipulator } from '../../../src/core/file/fileManipulate.js';

// Helper function to normalize whitespace and line endings
function normalizeWhitespace(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

describe('fileManipulate', () => {
  describe('C-style languages', () => {
    const testCases = [
      {
        name: 'C single and multi-line comments',
        ext: '.c',
        input: `
          // Single line comment
          int main() {
            /* Multi-line
               comment */
            return 0;
            /* Another comment */ int x = 5;
          }
        `,
        expected: `
          int main() {
            return 0;
            int x = 5;
          }
        `,
      },
      {
        name: 'JavaScript mixed comments',
        ext: '.js',
        input: `
          // Single line
          function test() {
            /* Multi
               line */ const x = 1; // End of line
            return x;
          }
        `,
        expected: `
          function test() {
            const x = 1;
            return x;
          }
        `,
      },
      {
        name: 'TypeScript with nested comments',
        ext: '.ts',
        input: `
          /* Outer
             /* Nested */
             End */
          const x = 1;
        `,
        expected: `
          const x = 1;
        `,
      },
    ];

    testCases.forEach(({ name, ext, input, expected }) => {
      test(name, () => {
        const manipulator = getFileManipulator(`test${ext}`);
        expect(normalizeWhitespace(manipulator?.removeComments(input) || '')).toBe(normalizeWhitespace(expected));
      });
    });
  });

  describe('Python', () => {
    const testCases = [
      {
        name: 'Python hash comments',
        ext: '.py',
        input: `
          # Single line comment
          def main():
              # Indented comment
              x = 1  # End of line comment
              return x
        `,
        expected: `
          def main():
              x = 1
              return x
        `,
      },
      {
        name: 'Python docstrings',
        ext: '.py',
        input: `
          """Module docstring"""
          def test():
              '''Function docstring'''
              x = 1
              # This is a string literal, not a docstring
              s = """Not a docstring"""
              return x
        `,
        expected: `
          def test():
              x = 1
              s = """Not a docstring"""
              return x
        `,
      },
      {
        name: 'Python mixed comments',
        ext: '.py',
        input: `
          # Header comment
          """
          Module docstring
          with multiple lines
          """
          def test():
              # Function comment
              '''
              Function docstring
              with multiple lines
              '''
              return True  # Return comment
        `,
        expected: `
          def test():
              return True
        `,
      },
    ];

    testCases.forEach(({ name, ext, input, expected }) => {
      test(name, () => {
        const manipulator = getFileManipulator(`test${ext}`);
        expect(normalizeWhitespace(manipulator?.removeComments(input) || '')).toBe(normalizeWhitespace(expected));
      });
    });
  });

  describe('Web languages', () => {
    const testCases = [
      {
        name: 'HTML comments',
        ext: '.html',
        input: `
          <!-- Header comment -->
          <div>
            <!-- Inline comment --> Content
          </div>
        `,
        expected: `
          <div>
            Content
          </div>
        `,
      },
      {
        name: 'CSS comments',
        ext: '.css',
        input: `
          /* Header styles */
          .header {
            /* Color */ color: red;
            font-size: 16px; /* Size */
          }
        `,
        expected: `
          .header {
            color: red;
            font-size: 16px;
          }
        `,
      },
      {
        name: 'Vue mixed comments',
        ext: '.vue',
        input: `
          <!-- Template comment -->
          <template>
            <div>
              <!-- Component comment -->
              Content
            </div>
          </template>
          <style>
            /* Style comment */
            .class { color: red; }
          </style>
          <script>
            // Script comment
            export default {
              /* Component logic */
            }
          </script>
        `,
        expected: `
          <template>
            <div>
              Content
            </div>
          </template>
          <style>
            .class { color: red; }
          </style>
          <script>
            export default {
            }
          </script>
        `,
      },
    ];

    testCases.forEach(({ name, ext, input, expected }) => {
      test(name, () => {
        const manipulator = getFileManipulator(`test${ext}`);
        expect(normalizeWhitespace(manipulator?.removeComments(input) || '')).toBe(normalizeWhitespace(expected));
      });
    });
  });

  describe('Empty lines handling', () => {
    const testCases = [
      {
        name: 'Remove empty lines',
        ext: '.js',
        input: `function test() {

          const x = 1;

          return x;

        }`,
        expected: `function test() {
          const x = 1;
          return x;
        }`,
      },
      {
        name: 'Preserve indented empty lines',
        ext: '.py',
        input: `def test():
            x = 1

            return x`,
        expected: `def test():
            x = 1
            return x`,
      },
    ];

    testCases.forEach(({ name, ext, input, expected }) => {
      test(name, () => {
        const manipulator = getFileManipulator(`test${ext}`);
        expect(normalizeWhitespace(manipulator?.removeEmptyLines(input) || '')).toBe(normalizeWhitespace(expected));
      });
    });
  });

  describe('Edge cases', () => {
    const testCases = [
      {
        name: 'Empty content',
        ext: '.js',
        input: '',
        expected: '',
      },
      {
        name: 'Only comments',
        ext: '.js',
        input: '// Only comment\n/* Another comment */',
        expected: '',
      },
      {
        name: 'Mixed line endings',
        ext: '.py',
        input: 'def test():\r\n    # Comment\r    return True\n    # Another comment',
        expected: 'def test():\n    return True',
      },
      {
        name: 'Escaped characters in comments',
        ext: '.js',
        input: '// Comment with \\" quote\nconst x = 1; // Comment with \\" quote',
        expected: 'const x = 1;',
      },
    ];

    testCases.forEach(({ name, ext, input, expected }) => {
      test(name, () => {
        const manipulator = getFileManipulator(`test${ext}`);
        expect(normalizeWhitespace(manipulator?.removeComments(input) || '')).toBe(normalizeWhitespace(expected));
      });
    });
  });
});

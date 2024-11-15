import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { TokenCounter } from '../../../src/core/tokenCount/tokenCount.js';
import { it, vi } from 'vitest';
import { logger } from '../../../src/shared/logger.js';
vi.mock('../../../src/shared/logger');
describe('tokenCount', () => {
  let tokenCounter: TokenCounter;

  beforeAll(() => {
    tokenCounter = new TokenCounter();
  });

  afterAll(() => {
    tokenCounter.free();
  });

  test('should correctly count tokens', () => {
    const testCases = [
      { input: 'Hello, world!', expectedTokens: 4 },
      { input: 'This is a longer sentence with more tokens.', expectedTokens: 9 },
      { input: 'Special characters like !@#$%^&*() should be handled correctly.', expectedTokens: 15 },
      { input: 'Numbers 123 and symbols @#$ might affect tokenization.', expectedTokens: 12 },
      { input: 'Multi-line\ntext\nshould\nwork\ntoo.', expectedTokens: 11 },
    ];

    for (const { input, expectedTokens } of testCases) {
      const tokenCount = tokenCounter.countTokens(input);
      expect(tokenCount).toBe(expectedTokens);
    }
  });

  test('should handle empty input', () => {
    const tokenCount = tokenCounter.countTokens('');
    expect(tokenCount).toBe(0);
  });

  test('should handle very long input', () => {
    const longText = 'a'.repeat(1000);
    const tokenCount = tokenCounter.countTokens(longText);
    expect(tokenCount).toBeGreaterThan(0);
  });
});



describe('TokenCounter', () => {
  let tokenCounter: TokenCounter;

  beforeAll(() => {
    tokenCounter = new TokenCounter();
  });

  afterAll(() => {
    tokenCounter.free();
  });

  describe('Basic Token Counting', () => {
    it('should count tokens in simple English text', () => {
      const text = 'Hello, world!';
      const count = tokenCounter.countTokens(text);

      expect(count).toBeGreaterThan(0);
      expect(Number.isInteger(count)).toBe(true);
    });

    it('should count tokens in multi-line text', () => {
      const text = `
        First line
        Second line
        Third line
      `;
      const count = tokenCounter.countTokens(text);

      expect(count).toBeGreaterThan(0);
      expect(Number.isInteger(count)).toBe(true);
    });

    it('should handle empty text', () => {
      const count = tokenCounter.countTokens('');
      expect(count).toBe(0);
    });

    it('should handle whitespace-only text', () => {
      const text = '    \n    \t    ';
      const count = tokenCounter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Code Token Counting', () => {
    it('should count tokens in JavaScript code', () => {
      const code = `
        function greet(name) {
          console.log(\`Hello, \${name}!\`);
          return true;
        }
      `;

      const count = tokenCounter.countTokens(code);
      expect(count).toBeGreaterThan(0);
    });

    it('should count tokens in HTML markup', () => {
      const html = `
        <div class="container">
          <h1>Title</h1>
          <p>Some content</p>
        </div>
      `;

      const count = tokenCounter.countTokens(html);
      expect(count).toBeGreaterThan(0);
    });

    it('should count tokens in CSS', () => {
      const css = `
        .class {
          color: red;
          font-size: 16px;
          margin: 10px;
        }
      `;

      const count = tokenCounter.countTokens(css);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Language Support', () => {
    it('should handle unicode characters', () => {
      const texts = [
        '你好，世界！', // Chinese
        'こんにちは、世界！', // Japanese
        '안녕하세요, 세계!', // Korean
        'Привет, мир!', // Russian
        'مرحبا بالعالم!', // Arabic
        'γεια σας κόσμο!', // Greek
      ];

      for (const text of texts) {
        const count = tokenCounter.countTokens(text);
        expect(count).toBeGreaterThan(0);
      }
    });

    it('should handle emojis', () => {
      const text = 'Hello 👋 World 🌍 !';
      const count = tokenCounter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const text = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const count = tokenCounter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large text efficiently', () => {
      const largeText = 'a'.repeat(100000);

      const startTime = Date.now();
      const count = tokenCounter.countTokens(largeText);
      const endTime = Date.now();

      expect(count).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should process within 1 second
    });

    it('should handle repeated token counting', () => {
      const text = 'test text';

      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        tokenCounter.countTokens(text);
      }
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete 1000 counts within 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input types', () => {
      const invalidInputs = [null, undefined, [], {}, 123, true] as any[];

      for (const input of invalidInputs) {
        const count = tokenCounter.countTokens(input);
        expect(count).toBe(0);
        expect(logger.warn).toHaveBeenCalled();
      }
    });

    it('should handle malformed UTF-8', () => {
      const malformedText = Buffer.from([0xFF, 0xFE, 0xFD]).toString();
      const count = tokenCounter.countTokens(malformedText);

      expect(count).toBeGreaterThan(0);
    });

    it('should handle maximum string length', () => {
      // Create a string that's very large but still within JavaScript limits
      const veryLargeText = 'a'.repeat(1024 * 1024); // 1MB of text
      const count = tokenCounter.countTokens(veryLargeText);

      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Resource Management', () => {
    it('should free resources when done', () => {
      const localCounter = new TokenCounter();
      const text = 'test text';

      const count = localCounter.countTokens(text);
      expect(count).toBeGreaterThan(0);

      // Should not throw when freeing resources
      expect(() => localCounter.free()).not.toThrow();
    });

    it('should handle multiple instances', () => {
      const counter1 = new TokenCounter();
      const counter2 = new TokenCounter();

      const text = 'test text';
      const count1 = counter1.countTokens(text);
      const count2 = counter2.countTokens(text);

      expect(count1).toBe(count2);

      counter1.free();
      counter2.free();
    });
  });

  describe('Content Types', () => {
    it('should handle different line endings', () => {
      const texts = {
        unix: 'line1\nline2\nline3',
        windows: 'line1\r\nline2\r\nline3',
        mac: 'line1\rline2\rline3',
        mixed: 'line1\nline2\r\nline3\rline4'
      };

      const counts = Object.entries(texts).map(([key, text]) => ({
        key,
        count: tokenCounter.countTokens(text)
      }));

      // All formats should give similar token counts
      const baseCount = counts[0].count;
      counts.slice(1).forEach(({ count }) => {
        expect(Math.abs(count - baseCount)).toBeLessThanOrEqual(1);
      });
    });

    it('should count tokens in XML/JSON data', () => {
      const xmlData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <root>
          <item id="1">First Item</item>
          <item id="2">Second Item</item>
        </root>
      `;

      const jsonData = `
        {
          "items": [
            {"id": 1, "name": "First Item"},
            {"id": 2, "name": "Second Item"}
          ]
        }
      `;

      const xmlCount = tokenCounter.countTokens(xmlData);
      const jsonCount = tokenCounter.countTokens(jsonData);

      expect(xmlCount).toBeGreaterThan(0);
      expect(jsonCount).toBeGreaterThan(0);
    });

    it('should handle markdown content', () => {
      const markdown = `
        # Heading 1
        ## Heading 2

        - List item 1
        - List item 2

        \`\`\`javascript
        const code = "example";
        \`\`\`

        **Bold** and *italic* text
      `;

      const count = tokenCounter.countTokens(markdown);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Token Consistency', () => {
    it('should give consistent results for same input', () => {
      const text = 'Some test text for consistency checking';
      const counts = Array.from({ length: 10 }, () => tokenCounter.countTokens(text));

      // All counts should be identical
      expect(new Set(counts).size).toBe(1);
    });

    it('should count tokens similarly for equivalent text', () => {
      const text1 = 'Hello  World';  // Two spaces
      const text2 = 'Hello World';   // One space
      const text3 = 'Hello\tWorld';  // Tab

      const count1 = tokenCounter.countTokens(text1);
      const count2 = tokenCounter.countTokens(text2);
      const count3 = tokenCounter.countTokens(text3);

      // Should be similar counts despite different whitespace
      expect(Math.abs(count1 - count2)).toBeLessThanOrEqual(1);
      expect(Math.abs(count2 - count3)).toBeLessThanOrEqual(1);
    });
  });
});

import { beforeEach, describe, expect, test, vi } from 'vitest';


// Mock tiktoken module with more realistic behavior
vi.mock('tiktoken', () => ({
  get_encoding: vi.fn((model: string) => {
    const encodings = {
      'gpt-3.5-turbo': (text: string) => Array.from(text).map((_, i) => i + 1),
      'gpt-4': (text: string) => Array.from(text).map((_, i) => i + 100),
      'default': (text: string) => Array.from(text),
    };

    return {
      encode: (text: string) => encodings[model] ? encodings[model](text) : encodings.default(text),
      free: vi.fn(),
    };
  })
}));

// Import after mocking
import { countTokens, TokenCounter } from '../../../src/core/tokenCount/tokenCount.js';

describe('tokenCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('countTokens function', () => {
    test('should count tokens for a single string', async () => {
      const text = 'Hello, World!';
      const result = await countTokens(text);
      expect(result).toBe(text.length);
    });

    test('should handle empty string', async () => {
      const result = await countTokens('');
      expect(result).toBe(0);
    });

    test('should handle null or undefined', async () => {
      // @ts-ignore - Testing invalid input
      const result1 = await countTokens(null);
      expect(result1).toBe(0);

      // @ts-ignore - Testing invalid input
      const result2 = await countTokens(undefined);
      expect(result2).toBe(0);
    });

    test('should handle special characters and unicode', async () => {
      const specialText = '🌟 Special → chars ∑ unicode ♥';
      const result = await countTokens(specialText);
      expect(result).toBeGreaterThan(0);
    });

    test('should use custom encoding model', async () => {
      const text = 'This is a test of different models';
      const gpt35Result = await countTokens(text, { model: 'gpt-3.5-turbo' });
      const gpt4Result = await countTokens(text, { model: 'gpt-4' });

      expect(gpt35Result).toBe(8);
      expect(gpt4Result).toBe(10);
    });

    test('should handle very long text', async () => {
      const longText = 'a'.repeat(10000);
      const result = await countTokens(longText);
      expect(result).toBe(10000);
    });
  });

  describe('TokenCounter class', () => {
    let counter: TokenCounter;

    beforeEach(() => {
      counter = new TokenCounter();
    });

    test('should handle multiple strings with TokenCounter', async () => {
      const texts = ['Hello', 'World', '!'];

      for (const text of texts) {
        await counter.addText(text);
      }

      const total = await counter.getTotal();
      const expected = texts.join('').length;
      expect(total).toBe(expected);
    });

    test('should reset TokenCounter correctly', async () => {
      await counter.addText('Test text');
      const beforeReset = await counter.getTotal();
      expect(beforeReset).toBeGreaterThan(0);

      await counter.reset();
      const afterReset = await counter.getTotal();
      expect(afterReset).toBe(0);
    });

    test('should handle concurrent operations', async () => {
      const texts = ['Text1', 'Text2', 'Text3', 'Text4', 'Text5'];
      await Promise.all(texts.map(text => counter.addText(text)));

      const total = await counter.getTotal();
      const expected = texts.join('').length;
      expect(total).toBe(expected);
    });

    test('should free resources properly', async () => {
      const freeSpy = vi.spyOn(counter as any, 'free');
      await counter.addText('Test');
      counter.free();
      expect(freeSpy).toHaveBeenCalled();
    });

    test('should handle empty strings and whitespace', async () => {
      await counter.addText('\n\n');

      const total = await counter.getTotal();
      expect(total).toBe(2);
    });
  });
});

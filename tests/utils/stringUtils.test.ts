import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../src/utils/stringUtils.js';

describe('stringUtils', () => {
  describe('escapeHtml', () => {
    it('should escape ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape less-than signs', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b');
    });

    it('should escape greater-than signs', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#039;s');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should return string unchanged if no special characters', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(escapeHtml('&<>"\''))
        .toBe('&amp;&lt;&gt;&quot;&#039;');
    });

    it('should handle multiple ampersands', () => {
      expect(escapeHtml('a & b & c')).toBe('a &amp; b &amp; c');
    });

    it('should handle HTML tag with attributes', () => {
      expect(escapeHtml('<a href="url">link</a>')).toBe(
        '&lt;a href=&quot;url&quot;&gt;link&lt;/a&gt;'
      );
    });

    it('should not double-escape already escaped characters', () => {
      const input = '&amp;';
      const result = escapeHtml(input);
      expect(result).toBe('&amp;amp;');
    });
  });
});

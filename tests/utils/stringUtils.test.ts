import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../src/utils/stringUtils.js';

describe('stringUtils', () => {
  describe('escapeHtml', () => {
    it('should escape ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape less-than signs', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('should escape greater-than signs', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#039;s');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<a href="test&id=1">it\'s</a>')).toBe(
        '&lt;a href=&quot;test&amp;id=1&quot;&gt;it&#039;s&lt;/a&gt;'
      );
    });

    it('should return empty string unchanged', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should return plain text unchanged', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });

    it('should escape multiple ampersands', () => {
      expect(escapeHtml('a & b & c')).toBe('a &amp; b &amp; c');
    });

    it('should handle strings with only special characters', () => {
      expect(escapeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#039;');
    });
  });
});

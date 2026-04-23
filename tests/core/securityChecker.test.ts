import { describe, expect, it } from 'vitest';
import checkSecurity from '../../src/core/securityChecker.js';
import { checkSecurity as checkSecurityNamed } from '../../src/core/securityChecker.js';

describe('securityChecker', () => {
  describe('checkSecurity', () => {
    it('should return isValid true for clean content', () => {
      const result = checkSecurity('file.ts', 'const x = 1;');
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect eval() usage', () => {
      const result = checkSecurity('file.ts', 'const x = eval("1+1");');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains potentially unsafe eval() usage');
    });

    it('should detect process.env usage', () => {
      const result = checkSecurity('file.ts', 'const key = process.env.API_KEY;');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains environment variable access');
    });

    it('should detect both eval and process.env', () => {
      const content = 'eval(process.env.CODE);';
      const result = checkSecurity('file.ts', content);
      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(2);
    });

    it('should return empty issues array for clean content', () => {
      const result = checkSecurity('file.ts', 'function add(a, b) { return a + b; }');
      expect(result.issues).toEqual([]);
    });

    it('should handle empty content', () => {
      const result = checkSecurity('file.ts', '');
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should work with different file paths', () => {
      const result = checkSecurity('path/to/script.js', 'const x = 1;');
      expect(result.isValid).toBe(true);
    });

    it('should be accessible as named export', () => {
      const result = checkSecurityNamed('file.ts', 'const x = 1;');
      expect(result.isValid).toBe(true);
    });

    it('should handle multiline content', () => {
      const content = `
function hello() {
  console.log('world');
}
`;
      const result = checkSecurity('file.ts', content);
      expect(result.isValid).toBe(true);
    });
  });
});

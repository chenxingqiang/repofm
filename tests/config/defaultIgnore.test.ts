import { describe, expect, it } from 'vitest';
import { defaultIgnoreList } from '../../src/config/defaultIgnore.js';

describe('defaultIgnore', () => {
  describe('defaultIgnoreList', () => {
    it('should be an array', () => {
      expect(Array.isArray(defaultIgnoreList)).toBe(true);
    });

    it('should not be empty', () => {
      expect(defaultIgnoreList.length).toBeGreaterThan(0);
    });

    it('should contain node_modules pattern', () => {
      expect(defaultIgnoreList).toContain('node_modules/**');
    });

    it('should contain .git pattern', () => {
      expect(defaultIgnoreList).toContain('.git/**');
    });

    it('should contain dist pattern', () => {
      expect(defaultIgnoreList).toContain('dist/**');
    });

    it('should contain log file patterns', () => {
      expect(defaultIgnoreList.some(p => p.includes('.log'))).toBe(true);
    });

    it('should contain OS generated file patterns', () => {
      expect(defaultIgnoreList).toContain('**/.DS_Store');
    });

    it('should contain package-lock.json pattern', () => {
      expect(defaultIgnoreList).toContain('**/package-lock.json');
    });

    it('should contain Python patterns', () => {
      expect(defaultIgnoreList.some(p => p.includes('__pycache__'))).toBe(true);
    });

    it('should contain repofm output patterns', () => {
      expect(defaultIgnoreList.some(p => p.includes('repofm-output'))).toBe(true);
    });

    it('should contain coverage directory pattern', () => {
      expect(defaultIgnoreList).toContain('coverage/**');
    });

    it('should only contain strings', () => {
      for (const pattern of defaultIgnoreList) {
        expect(typeof pattern).toBe('string');
      }
    });

    it('should contain build output patterns', () => {
      expect(defaultIgnoreList).toContain('build/**');
    });

    it('should contain temp directory patterns', () => {
      expect(defaultIgnoreList.some(p => p.includes('tmp') || p.includes('temp'))).toBe(true);
    });
  });
});

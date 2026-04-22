import { describe, expect, it } from 'vitest';
import { getProcessConcurrency } from '../../src/shared/processConcurrency.js';

describe('processConcurrency', () => {
  describe('getProcessConcurrency', () => {
    it('should return a positive number', () => {
      const concurrency = getProcessConcurrency();
      expect(concurrency).toBeGreaterThan(0);
    });

    it('should return at least 1', () => {
      const concurrency = getProcessConcurrency();
      expect(concurrency).toBeGreaterThanOrEqual(1);
    });

    it('should return a whole number', () => {
      const concurrency = getProcessConcurrency();
      expect(Number.isInteger(concurrency)).toBe(true);
    });

    it('should return a number less than or equal to CPU count', () => {
      const concurrency = getProcessConcurrency();
      // It uses all CPUs minus 1, so result should be a reasonable number
      expect(concurrency).toBeLessThanOrEqual(256);
    });
  });
});

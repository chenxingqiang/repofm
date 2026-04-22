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
      // Practical upper bound: no consumer hardware has more than 256 cores
      const MAX_REASONABLE_CPU_COUNT = 256;
      expect(concurrency).toBeLessThanOrEqual(MAX_REASONABLE_CPU_COUNT);
    });
  });
});

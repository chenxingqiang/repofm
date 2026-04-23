import { describe, expect, it, vi } from 'vitest';
import { getProcessConcurrency } from '../../src/shared/processConcurrency.js';
import os from 'node:os';

describe('processConcurrency', () => {
  describe('getProcessConcurrency', () => {
    it('should return at least 1', () => {
      const result = getProcessConcurrency();
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should return a number', () => {
      const result = getProcessConcurrency();
      expect(typeof result).toBe('number');
    });

    it('should use availableParallelism when available', () => {
      const spy = vi.spyOn(os, 'availableParallelism').mockReturnValue(8);
      const result = getProcessConcurrency();
      expect(result).toBe(7); // 8 - 1
      spy.mockRestore();
    });

    it('should fall back to cpus().length when availableParallelism is not available', () => {
      const originalFn = os.availableParallelism;
      // Temporarily remove availableParallelism
      (os as any).availableParallelism = undefined;
      const cpusSpy = vi.spyOn(os, 'cpus').mockReturnValue(
        Array(4).fill({ model: 'Test CPU', speed: 2000, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } })
      );

      const result = getProcessConcurrency();
      expect(result).toBe(3); // 4 - 1

      cpusSpy.mockRestore();
      (os as any).availableParallelism = originalFn;
    });

    it('should return 1 when only one CPU is available', () => {
      const spy = vi.spyOn(os, 'availableParallelism').mockReturnValue(1);
      const result = getProcessConcurrency();
      expect(result).toBe(1); // max(1, 1-1=0) => 1
      spy.mockRestore();
    });

    it('should return 1 when zero CPUs reported (edge case)', () => {
      const spy = vi.spyOn(os, 'availableParallelism').mockReturnValue(0);
      const result = getProcessConcurrency();
      expect(result).toBe(1); // max(1, 0-1=-1) => 1
      spy.mockRestore();
    });

    it('should be one less than available parallelism for multiple CPUs', () => {
      const cpuCount = 16;
      const spy = vi.spyOn(os, 'availableParallelism').mockReturnValue(cpuCount);
      const result = getProcessConcurrency();
      expect(result).toBe(cpuCount - 1);
      spy.mockRestore();
    });
  });
});

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

describe('globalDirectory', () => {
  describe('getGlobalDirectory', () => {
    const originalPlatform = process.platform;
    const originalEnv = { ...process.env };

    afterEach(() => {
      vi.unstubAllEnvs();
      // restore env
      process.env.XDG_CONFIG_HOME = originalEnv.XDG_CONFIG_HOME;
      process.env.LOCALAPPDATA = originalEnv.LOCALAPPDATA;
    });

    it('should use XDG_CONFIG_HOME when set on non-windows', async () => {
      if (process.platform === 'win32') return; // skip on windows

      vi.stubEnv('XDG_CONFIG_HOME', '/custom/config');
      delete process.env.LOCALAPPDATA;

      const { getGlobalDirectory } = await import('../../src/config/globalDirectory.js');
      const result = getGlobalDirectory();
      expect(result).toContain('/custom/config');
      expect(result).toContain('repofm');
    });

    it('should fall back to home dir on non-windows without XDG_CONFIG_HOME', async () => {
      if (process.platform === 'win32') return; // skip on windows

      delete process.env.XDG_CONFIG_HOME;
      delete process.env.LOCALAPPDATA;

      const { getGlobalDirectory } = await import('../../src/config/globalDirectory.js');
      const result = getGlobalDirectory();
      expect(result).toContain('repofm');
      expect(result).toContain('.config');
    });

    it('should return a string', async () => {
      const { getGlobalDirectory } = await import('../../src/config/globalDirectory.js');
      const result = getGlobalDirectory();
      expect(typeof result).toBe('string');
    });

    it('should return a path containing repofm', async () => {
      const { getGlobalDirectory } = await import('../../src/config/globalDirectory.js');
      const result = getGlobalDirectory();
      expect(result).toContain('repofm');
    });
  });
});

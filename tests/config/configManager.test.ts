import { describe, expect, it, beforeEach } from 'vitest';
import { ConfigManager, loadConfig } from '../../src/config/ConfigManager.js';

describe('ConfigManager', () => {
  beforeEach(() => {
    // Reset the singleton between tests
    (ConfigManager as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return a ConfigManager instance', () => {
      const instance = ConfigManager.getInstance();
      expect(instance).toBeInstanceOf(ConfigManager);
    });
  });

  describe('getConfig', () => {
    it('should return the current config', () => {
      const instance = ConfigManager.getInstance();
      const config = instance.getConfig();
      expect(config).toBeDefined();
      expect(config).toHaveProperty('output');
      expect(config).toHaveProperty('include');
      expect(config).toHaveProperty('ignore');
      expect(config).toHaveProperty('security');
    });

    it('should return default output config', () => {
      const instance = ConfigManager.getInstance();
      const config = instance.getConfig();
      expect(config.output).toHaveProperty('style');
      expect(config.output).toHaveProperty('filePath');
    });
  });

  describe('updateConfig', () => {
    it('should update config with partial config', () => {
      const instance = ConfigManager.getInstance();
      instance.updateConfig({ include: ['**/*.ts'] });
      const config = instance.getConfig();
      expect(config.include).toEqual(['**/*.ts']);
    });

    it('should merge config without overwriting unrelated fields', () => {
      const instance = ConfigManager.getInstance();
      const originalSecurity = instance.getConfig().security;
      instance.updateConfig({ include: ['**/*.ts'] });
      expect(instance.getConfig().security).toEqual(originalSecurity);
    });

    it('should allow updating security config', () => {
      const instance = ConfigManager.getInstance();
      instance.updateConfig({ security: { enableSecurityCheck: true } });
      expect(instance.getConfig().security.enableSecurityCheck).toBe(true);
    });
  });
});

describe('loadConfig', () => {
  beforeEach(() => {
    (ConfigManager as any).instance = undefined;
  });

  it('should return a config object', () => {
    const config = loadConfig();
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('should return config with required properties', () => {
    const config = loadConfig();
    expect(config).toHaveProperty('output');
    expect(config).toHaveProperty('include');
    expect(config).toHaveProperty('ignore');
    expect(config).toHaveProperty('security');
  });
});

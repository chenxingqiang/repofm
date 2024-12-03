import { CodeContextManager } from '../CodeContextManager';
import { ContextConfig } from '../types';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CodeContextManager', () => {
  const defaultConfig: ContextConfig = {
    workspaceRoot: '/test/workspace',
    excludePatterns: [
      '**/node_modules/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**'
    ],
    maxDepth: 5,
    ignoreCase: true
  };

  beforeEach(() => {
    // Reset the instance before each test
    CodeContextManager.resetInstance();
  });

  it('should create a singleton instance', () => {
    const instance1 = CodeContextManager.getInstance(defaultConfig);
    const instance2 = CodeContextManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should throw an error when initializing without config', () => {
    expect(() => CodeContextManager.getInstance()).toThrow('Workspace root is required for initialization');
  });

  it('should reset the instance', () => {
    const instance1 = CodeContextManager.getInstance(defaultConfig);
    CodeContextManager.resetInstance();
    const instance2 = CodeContextManager.getInstance(defaultConfig);
    
    expect(instance1).not.toBe(instance2);
  });

  it('should handle config initialization', () => {
    const instance = CodeContextManager.getInstance(defaultConfig);
    const config = instance.getConfig();
    
    expect(config.workspaceRoot).toBe(defaultConfig.workspaceRoot);
    expect(config.excludePatterns).toEqual(expect.arrayContaining(defaultConfig.excludePatterns));
  });

  it('should manage cache values', () => {
    const instance = CodeContextManager.getInstance(defaultConfig);
    const testKey = 'testKey';
    const testValue = { data: 'test' };
    
    instance.setCacheValue(testKey, testValue);
    expect(instance.getCacheValue(testKey)).toEqual(testValue);
  });

  it('should record and retrieve performance metrics', () => {
    const instance = CodeContextManager.getInstance(defaultConfig);
    const testLatency = 100;
    
    instance.recordOperationLatency(testLatency);
    expect(instance.getPerformanceMetrics().operationLatency).toBe(testLatency);
  });

  describe('Context Management', () => {
    it('should handle context stack operations', () => {
      const instance = CodeContextManager.getInstance(defaultConfig);
      const newContext = { maxDepth: 10 };
      
      instance.pushContext(newContext);
      expect(instance.getConfig().maxDepth).toBe(10);
      
      instance.popContext();
      expect(instance.getConfig().maxDepth).toBe(defaultConfig.maxDepth);
    });

    it('should support temporary context changes', async () => {
      const instance = CodeContextManager.getInstance(defaultConfig);
      const tempContext = { maxDepth: 15 };
      
      await instance.withTemporaryContext(tempContext, async () => {
        expect(instance.getConfig().maxDepth).toBe(15);
      });
      
      expect(instance.getConfig().maxDepth).toBe(defaultConfig.maxDepth);
    });
  });

  describe('Source File Validation', () => {
    it('should validate source files', () => {
      const instance = CodeContextManager.getInstance(defaultConfig);
      
      expect(instance.isValidSourceFile('src/valid/file.ts')).toBe(true);
      expect(instance.isValidSourceFile('node_modules/package/file.js')).toBe(false);
    });

    it('should handle complex glob patterns', () => {
      const instance = CodeContextManager.getInstance(defaultConfig);
      
      expect(instance.isValidSourceFile('src/test/file.test.ts')).toBe(false);
      expect(instance.isValidSourceFile('src/components/Button.spec.js')).toBe(false);
      expect(instance.isValidSourceFile('src/utils/helper.ts')).toBe(true);
      
      expect(instance.isValidSourceFile('src/__tests__/component.ts')).toBe(false);
      expect(instance.isValidSourceFile('test/unit/helper.js')).toBe(false);
      expect(instance.isValidSourceFile('src/components/test/utils.ts')).toBe(false);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeContextManager } from '../../src/features/contextManager/CodeContextManager';
import type { ContextConfig } from '../../src/features/contextManager/types';

describe('CodeContextManager Integration Tests', () => {
  const defaultConfig: ContextConfig = {
    workspaceRoot: '/test/workspace',
    excludePatterns: ['node_modules/**', '*.log'],
    maxDepth: 5,
    ignoreCase: true
  };

  beforeEach(() => {
    CodeContextManager.resetInstance();
  });

  it('should handle complex workspace initialization and configuration', () => {
    const instance = CodeContextManager.getInstance(defaultConfig);
    expect(instance).toBeDefined();
    expect(instance.getConfig()).toEqual(defaultConfig);
  });

  it('should maintain singleton state across multiple operations', () => {
    const instance1 = CodeContextManager.getInstance(defaultConfig);
    instance1.setCacheValue('testKey', 'testValue');

    const instance2 = CodeContextManager.getInstance();
    expect(instance2.getCacheValue('testKey')).toBe('testValue');
  });

  it('should handle nested context changes with complex operations', async () => {
    const instance = CodeContextManager.getInstance(defaultConfig);
    const initialConfig = instance.getConfig();

    // First level context change
    instance.pushContext({ maxDepth: 10 });
    expect(instance.getConfig().maxDepth).toBe(10);

    // Nested temporary context
    await instance.withTemporaryContext(
      { excludePatterns: ['temp/**'] },
      async () => {
        expect(instance.getConfig().excludePatterns).toEqual(['temp/**']);
        expect(instance.getConfig().maxDepth).toBe(10);

        // More nested changes
        instance.pushContext({ ignoreCase: false });
        expect(instance.getConfig().ignoreCase).toBe(false);
        instance.popContext();
      }
    );

    // Verify state after nested operations
    expect(instance.getConfig().maxDepth).toBe(10);
    expect(instance.getConfig().excludePatterns).toEqual(initialConfig.excludePatterns);

    instance.popContext();
    expect(instance.getConfig()).toEqual(initialConfig);
  });

  it('should correctly validate source files with complex patterns', () => {
    const instance = CodeContextManager.getInstance({
      ...defaultConfig,
      excludePatterns: [
        'node_modules/**',
        '**/*.{test,spec}.{js,ts}',
        'dist/**',
        'coverage/**',
        '.git/**'
      ]
    });

    // Valid files
    expect(instance.isValidSourceFile('src/components/Button.tsx')).toBe(true);
    expect(instance.isValidSourceFile('lib/utils/helper.js')).toBe(true);
    expect(instance.isValidSourceFile('docs/README.md')).toBe(true);

    // Invalid files
    expect(instance.isValidSourceFile('node_modules/react/index.js')).toBe(false);
    expect(instance.isValidSourceFile('src/utils/helper.test.ts')).toBe(false);
    expect(instance.isValidSourceFile('src/components/Button.spec.js')).toBe(false);
    expect(instance.isValidSourceFile('dist/bundle.js')).toBe(false);
    expect(instance.isValidSourceFile('coverage/lcov.info')).toBe(false);
    expect(instance.isValidSourceFile('.git/HEAD')).toBe(false);
  });

  it('should track performance metrics across operations', () => {
    const instance = CodeContextManager.getInstance(defaultConfig);

    // Simulate multiple operations
    instance.recordOperationLatency(100);
    instance.recordOperationLatency(150);
    instance.recordOperationLatency(200);

    const metrics = instance.getPerformanceMetrics();
    expect(metrics.operationLatency).toBeGreaterThan(0);
  });

  it('should handle cache operations with different value types', () => {
    const instance = CodeContextManager.getInstance(defaultConfig);

    // Test different value types
    instance.setCacheValue('string', 'test');
    instance.setCacheValue('number', 42);
    instance.setCacheValue('boolean', true);
    instance.setCacheValue('object', { key: 'value' });
    instance.setCacheValue('array', [1, 2, 3]);

    expect(instance.getCacheValue('string')).toBe('test');
    expect(instance.getCacheValue('number')).toBe(42);
    expect(instance.getCacheValue('boolean')).toBe(true);
    expect(instance.getCacheValue('object')).toEqual({ key: 'value' });
    expect(instance.getCacheValue('array')).toEqual([1, 2, 3]);
  });

  it('should handle concurrent context operations', async () => {
    const instance = CodeContextManager.getInstance(defaultConfig);
    const initialConfig = instance.getConfig();

    const operations = Array(5).fill(null).map(async (_, index) => {
      const tempContext = { maxDepth: 10 + index };
      return instance.withTemporaryContext(tempContext, async () => {
        expect(instance.getConfig().maxDepth).toBe(10 + index);
        return index;
      });
    });

    const results = await Promise.all(operations);
    expect(results).toEqual([0, 1, 2, 3, 4]);
    expect(instance.getConfig()).toEqual(initialConfig);
  });
});

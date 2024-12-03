import { describe, it, expect } from 'vitest';
import { CodeContextManager } from '../../src/features/contextManager';
import { ContextConfig } from '../../src/features/contextManager/types';

describe('CodeContextManager Integration Tests', () => {
  it('should handle complex workspace initialization and configuration', () => {
    const config: ContextConfig = {
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

    const instance = CodeContextManager.getInstance(config);
    expect(instance).toBeDefined();
    expect(instance.getConfig().workspaceRoot).toBe(config.workspaceRoot);
  });
});

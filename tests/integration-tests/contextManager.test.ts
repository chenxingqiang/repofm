import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { ContextManager } from '../../src/features/contextManager';
import * as fs from 'fs-extra';
import path from 'path';
import os from 'os';

vi.mock('fs-extra', async () => {
  return {
    ensureDir: vi.fn(),
    remove: vi.fn(),
    writeFile: vi.fn(),
  };
});

describe('ContextManager Integration Tests', () => {
  let contextManager: ContextManager;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), 'repofm-test-' + Math.random().toString(36).substring(7));
    await fs.ensureDir(testDir);

    // Initialize context manager
    contextManager = ContextManager.getInstance({
      workspaceRoot: testDir,
      excludePatterns: ['node_modules/**', '*.log'],
      maxDepth: 5,
      ignoreCase: true
    });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
    // Reset singleton instance
    ContextManager.resetInstance();
  });

  it('should handle workspace initialization', () => {
    const context = contextManager.getCurrentContext();
    expect(context.workspaceRoot).toBe(testDir);
    expect(context.excludePatterns).toContain('node_modules/**');
  });

  it('should validate source files', async () => {
    const testFile = path.join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'test content');
    
    expect(await contextManager.isValidSourceFile(testFile)).toBe(true);
  });

  it('should exclude node_modules files', async () => {
    const nodeModulesFile = path.join(testDir, 'node_modules', 'test.txt');
    await fs.ensureDir(path.dirname(nodeModulesFile));
    await fs.writeFile(nodeModulesFile, 'test content');
    
    expect(await contextManager.isValidSourceFile(nodeModulesFile)).toBe(false);
  });

  it('should exclude log files', async () => {
    const logFile = path.join(testDir, 'test.log');
    await fs.writeFile(logFile, 'test content');
    
    expect(await contextManager.isValidSourceFile(logFile)).toBe(false);
  });

  describe('Dynamic Context Features', () => {
    it('should handle context stack operations', () => {
      const newContext = {
        workspaceRoot: path.join(testDir, 'subdir'),
        excludePatterns: ['*.tmp'],
        maxDepth: 3
      };

      contextManager.pushContext(newContext);
      expect(contextManager.getCurrentContext().workspaceRoot).toBe(newContext.workspaceRoot);

      contextManager.popContext();
      expect(contextManager.getCurrentContext().workspaceRoot).toBe(testDir);
    });

    it('should support temporary context changes', async () => {
      const tempContext = {
        excludePatterns: ['*.temp'],
        maxDepth: 2
      };

      await contextManager.withTemporaryContext(tempContext, async () => {
        expect(contextManager.getCurrentContext().excludePatterns).toContain('*.temp');
        expect(contextManager.getCurrentContext().maxDepth).toBe(2);
      });

      expect(contextManager.getCurrentContext().excludePatterns).not.toContain('*.temp');
      expect(contextManager.getCurrentContext().maxDepth).toBe(5);
    });
  });
});

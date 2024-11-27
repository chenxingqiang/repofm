import { jest } from '@jest/globals';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ContextManager, ContextConfig } from '../index.js';

jest.mock('node:fs/promises');

describe('ContextManager', () => {
  const mockConfig: ContextConfig = {
    workspaceRoot: '/test/workspace',
    excludePatterns: ['node_modules/**', '*.log'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (ContextManager as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create new instance with config', () => {
      const manager = ContextManager.getInstance(mockConfig);
      expect(manager).toBeInstanceOf(ContextManager);
      expect(manager.getWorkspaceRoot()).toBe(mockConfig.workspaceRoot);
    });

    it('should throw error if getting instance without initialization', () => {
      expect(() => ContextManager.getInstance()).toThrow('ContextManager not initialized');
    });

    it('should return same instance on subsequent calls', () => {
      const manager1 = ContextManager.getInstance(mockConfig);
      const manager2 = ContextManager.getInstance();
      expect(manager1).toBe(manager2);
    });
  });

  describe('config getters', () => {
    let manager: ContextManager;

    beforeEach(() => {
      manager = ContextManager.getInstance(mockConfig);
    });

    it('should get workspace root', () => {
      expect(manager.getWorkspaceRoot()).toBe(mockConfig.workspaceRoot);
    });

    it('should get exclude patterns', () => {
      expect(manager.getExcludePatterns()).toEqual(mockConfig.excludePatterns);
    });

    it('should get default max depth', () => {
      expect(manager.getMaxDepth()).toBe(10);
    });

    it('should get custom max depth', () => {
      const customConfig = { ...mockConfig, maxDepth: 5 };
      const customManager = ContextManager.getInstance(customConfig);
      expect(customManager.getMaxDepth()).toBe(5);
    });

    it('should get default ignore case', () => {
      expect(manager.getIgnoreCase()).toBe(true);
    });

    it('should get custom ignore case', () => {
      const customConfig = { ...mockConfig, ignoreCase: false };
      const customManager = ContextManager.getInstance(customConfig);
      expect(customManager.getIgnoreCase()).toBe(false);
    });
  });

  describe('isPathExcluded', () => {
    let manager: ContextManager;

    beforeEach(() => {
      manager = ContextManager.getInstance(mockConfig);
    });

    it('should exclude paths outside workspace', async () => {
      const result = await manager.isPathExcluded('/other/path');
      expect(result).toBe(true);
    });

    it('should exclude paths matching patterns', async () => {
      const result = await manager.isPathExcluded('/test/workspace/node_modules/package');
      expect(result).toBe(true);
    });

    it('should not exclude valid paths', async () => {
      const result = await manager.isPathExcluded('/test/workspace/src/file.ts');
      expect(result).toBe(false);
    });

    it('should handle case sensitivity correctly', async () => {
      const customConfig = { ...mockConfig, ignoreCase: false };
      const customManager = ContextManager.getInstance(customConfig);
      const result = await customManager.isPathExcluded('/test/workspace/NODE_MODULES/package');
      expect(result).toBe(false);
    });
  });

  describe('validatePath', () => {
    let manager: ContextManager;

    beforeEach(() => {
      manager = ContextManager.getInstance(mockConfig);
      (fs.stat as jest.Mock).mockResolvedValue({
        isDirectory: () => true,
        isFile: () => false,
      });
    });

    it('should validate directory path', async () => {
      await expect(manager.validatePath('/test/workspace/src')).resolves.toBeUndefined();
    });

    it('should validate file path', async () => {
      (fs.stat as jest.Mock).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      });
      await expect(manager.validatePath('/test/workspace/src/file.ts')).resolves.toBeUndefined();
    });

    it('should throw for non-existent path', async () => {
      (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
      await expect(manager.validatePath('/test/workspace/invalid')).rejects.toThrow('Path does not exist');
    });

    it('should throw for invalid path type', async () => {
      (fs.stat as jest.Mock).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => false,
      });
      await expect(manager.validatePath('/test/workspace/invalid')).rejects.toThrow('Invalid path type');
    });

    it('should throw for excluded path', async () => {
      await expect(manager.validatePath('/test/workspace/node_modules')).rejects.toThrow('Path is excluded');
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../index';
import type { ContextConfig } from '../types';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  
  const mockConfig: ContextConfig = {
    workspaceRoot: '/test/workspace',
    cloudSync: false,
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
    version: '1.0.0'
  };

  beforeEach(() => {
    ContextManager.resetInstance();
    contextManager = ContextManager.getInstance(mockConfig);
  });

  describe('Singleton Pattern', () => {
    it('should maintain a single instance', () => {
      const instance1 = ContextManager.getInstance(mockConfig);
      const instance2 = ContextManager.getInstance(mockConfig);
      expect(instance1).toBe(instance2);
    });
  });

  describe('Cache Management', () => {
    it('should cache and retrieve values', () => {
      const key = 'testKey';
      const value = 'testValue';
      
      contextManager.setCacheValue(key, value);
      expect(contextManager.getCacheValue(key)).toBe(value);
    });

    it('should handle cache misses', () => {
      expect(contextManager.getCacheValue('nonexistent')).toBeUndefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation latency', () => {
      const latency = 100;
      contextManager.recordOperationLatency(latency);
      const metrics = contextManager.getPerformanceMetrics();
      expect(metrics.operationLatency).toBe(latency);
    });

    it('should return a copy of metrics', () => {
      const metrics1 = contextManager.getPerformanceMetrics();
      const metrics2 = contextManager.getPerformanceMetrics();
      expect(metrics1).not.toBe(metrics2);
      expect(metrics1).toEqual(metrics2);
    });
  });

  describe('Configuration', () => {
    it('should maintain configuration', () => {
      const config = contextManager.getConfig();
      expect(config).toEqual(mockConfig);
    });

    it('should return a copy of config', () => {
      const config1 = contextManager.getConfig();
      const config2 = contextManager.getConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });
});

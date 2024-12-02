import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { ContextManager } from '../index';
import { createClient } from '@supabase/supabase-js';
import { PendingChange, SyncStatus, ContextSyncError, ContextConfig } from '../types';

// Enhanced Supabase mock
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  update: vi.fn().mockResolvedValue({ data: null, error: null }),
  upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  delete: vi.fn().mockResolvedValue({ data: null, error: null }),
  subscribe: vi.fn().mockReturnValue({
    subscription: { unsubscribe: vi.fn() }
  })
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('Dynamic Context with Supabase Integration', () => {
  let contextManager: ContextManager;
  const testConfig: ContextConfig = {
    workspaceRoot: '/test/path',
    cloudSync: true,
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
    version: '1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    contextManager = ContextManager.getInstance({
      ...testConfig,
      cloudSync: true,
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key'
    });
    
    // Initialize context for update tests
    contextManager['contextStack'] = [{
      id: 'ctx-1',
      workspaceRoot: '/test/1',
      cloudSync: true,
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      version: '1'
    }];
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Cloud Initialization', () => {
    it('should initialize Supabase client when cloud sync is enabled', () => {
      expect(createClient).toHaveBeenCalledWith(testConfig.supabaseUrl, testConfig.supabaseKey);
    });

    it('should not initialize Supabase client when cloud sync is disabled', () => {
      ContextManager.resetInstance();
      contextManager = ContextManager.getInstance({ ...testConfig, cloudSync: false });
      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe('Context Synchronization', () => {
    it('should sync context stack to cloud', async () => {
      await contextManager.syncContextStackToCloud();
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('should handle sync failures gracefully', async () => {
      mockSupabase.upsert.mockRejectedValueOnce(new Error('Network error'));
      await expect(contextManager.syncContextStackToCloud()).rejects.toThrow();
    });

    it('should load context stack from cloud', async () => {
      const mockContexts = [
        { id: 'ctx-1', workspaceRoot: '/test/1' },
        { id: 'ctx-2', workspaceRoot: '/test/2' }
      ];
      mockSupabase.select.mockResolvedValueOnce({ data: mockContexts, error: null });
      
      await contextManager.loadContextStackFromCloud();
      expect(contextManager.getAllContexts()).toHaveLength(mockContexts.length);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time context updates', async () => {
      const mockUpdate = { id: 'ctx-1', workspaceRoot: '/test/updated' };
      await contextManager.handleRealtimeUpdate(mockUpdate);
      expect(contextManager.findContextById('ctx-1')?.workspaceRoot).toBe('/test/updated');
    });

    it('should maintain consistency during concurrent updates', async () => {
      const updates = [
        { id: 'ctx-1', workspaceRoot: '/test/1' },
        { id: 'ctx-1', workspaceRoot: '/test/2' }
      ];
      
      await Promise.all(updates.map(update => contextManager.handleRealtimeUpdate(update)));
      expect(contextManager.findContextById('ctx-1')?.workspaceRoot).toBe('/test/2');
    });
  });

  describe('Advanced Sync Features', () => {
    describe('Retry Mechanism', () => {
      it('should retry failed sync operations', async () => {
        mockSupabase.upsert
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({ data: null, error: null });

        try {
          await contextManager.syncContextStackToCloud();
        } catch (error) {
          // Expected to throw on first attempt
        }

        // Fast-forward past retry timeout
        await vi.advanceTimersByTimeAsync(5100);

        // Second attempt should succeed
        expect(mockSupabase.upsert).toHaveBeenCalledTimes(2);
      });

      it('should limit retry attempts', async () => {
        const change: Omit<PendingChange, 'timestamp'> = {
          id: 'test-1',
          type: 'update',
          data: { workspaceRoot: '/test' },
          retryCount: 3
        };

        contextManager.addPendingChange(change);
        
        try {
          await contextManager.syncPendingChanges();
        } catch (error) {
          // Expected to throw
        }
        
        // Changes with retryCount >= 3 should be removed
        expect(contextManager.getPendingChanges()).toHaveLength(0);
      });
    });

    describe('Realtime Sync', () => {
      it('should handle concurrent modifications', async () => {
        const updates = Array.from({ length: 5 }, (_, i) => ({
          id: 'ctx-1',
          workspaceRoot: `/test/${i}`
        }));

        await Promise.all(updates.map(update => contextManager.handleRealtimeUpdate(update)));
        
        const context = contextManager.findContextById('ctx-1');
        expect(context?.workspaceRoot).toBe('/test/4');
      });

      it('should maintain data consistency during sync conflicts', async () => {
        const localChange = { id: 'ctx-1', workspaceRoot: '/local' };
        const remoteChange = { id: 'ctx-1', workspaceRoot: '/remote' };

        await contextManager.handleRealtimeUpdate(localChange);
        mockSupabase.select.mockResolvedValueOnce({ 
          data: [remoteChange],
          error: null 
        });

        await contextManager.loadContextStackFromCloud();
        expect(contextManager.findContextById('ctx-1')?.workspaceRoot).toBe('/remote');
      });
    });

    describe('Error Recovery', () => {
      it('should recover from authentication errors', async () => {
        mockSupabase.upsert.mockRejectedValueOnce(new Error('Auth error'));
        await expect(contextManager.syncContextStackToCloud()).rejects.toThrow();
        
        const status = contextManager.getSyncStatus();
        expect(status.isOnline).toBe(false);
        expect(status.syncErrors).toHaveLength(1);
      });

      it('should handle network state changes', async () => {
        await contextManager.updateNetworkState(false);
        await contextManager.updateContextConfig('ctx-1', { workspaceRoot: '/offline' });
        
        expect(contextManager.getPendingChanges()).toHaveLength(1);
        
        await contextManager.updateNetworkState(true);
        await contextManager.syncPendingChanges();
        
        expect(contextManager.getPendingChanges()).toHaveLength(0);
      });
    });
  });
});

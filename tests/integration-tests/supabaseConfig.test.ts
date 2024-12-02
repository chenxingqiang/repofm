import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseConfigManager } from '../../src/features/contextManager/supabaseConfig';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { test: true }, error: null }))
        }))
      }))
    }))
  };
});

describe('SupabaseConfigManager Integration Tests', () => {
  let configManager: SupabaseConfigManager;

  beforeEach(() => {
    vi.clearAllMocks();
    configManager = new SupabaseConfigManager();
  });

  it('should initialize with valid configuration', () => {
    configManager.initialize({
      url: 'https://test.supabase.co',
      anonKey: 'test-key'
    });

    expect(configManager.isInitialized()).toBe(true);
  });

  it('should test Supabase connection', async () => {
    configManager.initialize({
      url: 'https://test.supabase.co',
      anonKey: 'test-key'
    });

    const connectionResult = await configManager.testConnection();
    expect(connectionResult).toBe(true);
  });

  it('should throw error when accessing client before initialization', () => {
    expect(() => configManager.getClient()).toThrow('Supabase client not initialized');
  });

  it('should throw error when accessing config before initialization', () => {
    expect(() => configManager.getConfig()).toThrow('Supabase configuration not initialized');
  });

  it('should handle connection failures', async () => {
    // Mock a failed connection
    vi.mocked(createClient).mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Connection failed' } }))
        }))
      }))
    }));

    configManager.initialize({
      url: 'https://test.supabase.co',
      anonKey: 'test-key'
    });

    const connectionResult = await configManager.testConnection();
    expect(connectionResult).toBe(false);
  });
});

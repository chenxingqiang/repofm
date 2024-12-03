import { vi } from 'vitest';
import type { Logger } from '../types/logger';
import type { ContextConfig } from '../features/contextManager';

export const createMockLogger = (): Logger => ({
  log: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn()
});

export const createMockConfig = (): ContextConfig => ({
  workspaceRoot: '/test/workspace',
  cloudSync: false,
  supabaseUrl: 'https://test.supabase.co',
  supabaseKey: 'test-key',
  version: '1.0.0'
});

export function createTestConfig(overrides?: Partial<ContextConfig>): ContextConfig {
  return {
    workspaceRoot: '/test',
    excludePatterns: ['node_modules/**', '*.log'],
    maxDepth: 5,
    ignoreCase: true,
    ...overrides
  };
} 
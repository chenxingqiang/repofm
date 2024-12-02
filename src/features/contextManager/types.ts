export interface ContextConfig {
  workspaceRoot: string;
  cloudSync: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  version: string;
}

export interface PerformanceMetrics {
  operationLatency: number;
  cacheHitRate: number;
  requestCount: number;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export interface PersistentCache<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export enum MergeStrategy {
  OVERRIDE = 'override',
  MERGE = 'merge',
  APPEND = 'append',
  SKIP = 'skip'
}

export interface MergeOptions {
  strategy: MergeStrategy;
  conflictResolution?: 'manual' | 'auto';
} 
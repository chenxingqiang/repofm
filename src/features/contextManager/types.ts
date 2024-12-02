export interface ContextConfig {
  id?: string;
  parentId?: string;
  workspaceRoot: string;
  cloudSync: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  version: string;
  metadata?: Record<string, any>;
  tags?: string[];
  excludePatterns?: string[];
  maxDepth?: number;
  autoCommit?: boolean;
  ignoreCase?: boolean;
  contextType?: 'project' | 'workspace' | 'repository';
  priority?: number;
}

export enum MergeStrategy {
  TAKE_NEWEST = 'takeNewest',
  TAKE_LOCAL = 'takeLocal',
  TAKE_REMOTE = 'takeRemote',
  SMART = 'smart',
  LAST_WRITE_WINS = 'lastWriteWins',
  MANUAL_RESOLUTION = 'manualResolution',
  AUTO_MERGE = 'autoMerge'
}

export interface SyncMetrics {
  latency: number;
  errorRate: number;
  cacheHitRate: number;
  retryCount: number;
  syncDuration: number;
  lastSuccessful: number;
  averageLatency: number;
  operationLatency: number;
  syncLatency: number;
  compressionRatio: number;
  activeConnections: number;
  failureRate: number;
}

export interface SyncStatus {
  lastSync: number;
  status: 'success' | 'error' | 'pending';
  isOnline: boolean;
  syncErrors: ContextSyncError[];
  pendingChanges: number;
  syncMetrics: SyncMetrics;
}

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount?: number;
}

export enum SyncErrorCode {
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ContextSyncError extends Error {
  constructor(
    message: string,
    public code: SyncErrorCode = SyncErrorCode.UNKNOWN_ERROR,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ContextSyncError';
  }
}

export class DeepAnalytics {
  async analyze(data: any): Promise<any> {
    return null;
  }
}

export class RiskAnalyzer {
  async analyze(data: any): Promise<any> {
    return null;
  }
}

export class ClusterManager {
  constructor(private redisUrl: string) {}
  
  once(event: string, callback: (contextId: string, changes: any) => void): void {}
}

export class ZeroTrustManager {
  once(event: string, callback: (data: any) => void): void {}
}

export class IntrusionDetectionSystem {
  async detect(): Promise<void> {}
}

export class EncryptionManager {
  async encrypt(data: any): Promise<any> {
    return data;
  }
}

export class AuditSystem {
  getCurrentIP(): string {
    return '';
  }
  
  getUserAgent(): string {
    return '';
  }
  
  async archiveToStorage(logs: any[]): Promise<void> {}
}

export interface ContextVersion {
  id: string;
  version: number;
  timestamp: number;
  changes: Partial<ContextConfig>;
}

export class PersistentCache {
  async get(key: string): Promise<any> {
    return null;
  }
  
  async set(key: string, value: any): Promise<void> {}
  
  async del(key: string): Promise<void> {}
}

export class ContextCache {
  invalidate(contextId: string) {
    throw new Error('Method not implemented.');
  }
  clear() {
    throw new Error('Method not implemented.');
  }
  async get(key: string): Promise<any> {
    return null;
  }
  
  async set(key: string, value: any): Promise<void> {}
}

export class AutoCommit {
  checkAndCommit() {
    throw new Error('Method not implemented.');
  }
  constructor(private config: ContextConfig) {}
  
  start(): void {}
  stop(): void {}
} 
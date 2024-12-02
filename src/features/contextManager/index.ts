import path from 'path';
import fs from 'fs-extra';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { performAutoCommit } from '../autoCommit/index.js';
import { repofmError } from '../../shared/errorHandle.js';
import {
  ContextConfig,
  SyncStatus,
  SyncMetrics,
  PendingChange,
  ContextVersion,
  ContextCache,
  AutoCommit,
  ContextSyncError,
  SyncErrorCode,
  MergeStrategy
} from './types';
import { EventEmitter } from 'events';
import { ContextMerger } from './merger.js';

export interface UpdateContextOptions {
  temporary?: boolean;
  expiresIn?: number;
  propagateChanges?: boolean;
}

export interface PerformanceMetrics {
  operationLatency: number;
  cacheHitRate: number;
  syncLatency: number;
  compressionRatio: number;
  errorRate: number;
  activeConnections: number;
}

export interface HealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  issues: string[];
  services: {
    database: boolean;
    cache: boolean;
    sync: boolean;
  };
}

export class ContextManager extends EventEmitter {
  private static instance: ContextManager | null = null;
  private config: ContextConfig;
  private supabaseClient: SupabaseClient | null = null;
  private autoCommit: AutoCommit | null = null;
  private contextStack: ContextConfig[] = [];
  private snapshots: Map<string, ContextConfig[]> = new Map();
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private pendingChanges: PendingChange[] = [];
  private syncStatus: SyncStatus = {
    lastSync: Date.now(),
    status: 'pending',
    isOnline: true,
    syncErrors: [],
    pendingChanges: 0,
    syncMetrics: {
      latency: 0,
      errorRate: 0,
      cacheHitRate: 0,
      retryCount: 0,
      syncDuration: 0,
      lastSuccessful: 0,
      averageLatency: 0,
      operationLatency: 0,
      syncLatency: 0,
      compressionRatio: 0,
      activeConnections: 0,
      failureRate: 0
    }
  };
  private realtimeSubscription: any = null;
  private metrics: SyncMetrics = {
    latency: 0,
    errorRate: 0,
    cacheHitRate: 0,
    retryCount: 0,
    syncDuration: 0,
    lastSuccessful: 0,
    averageLatency: 0,
    operationLatency: 0,
    syncLatency: 0,
    compressionRatio: 0,
    activeConnections: 0,
    failureRate: 0
  };
  private versionHistory: Map<string, ContextVersion[]> = new Map();
  private batchQueue: PendingChange[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private cache: ContextCache;
  private merger: ContextMerger;
  private compressionEnabled: boolean = false;
  private performanceMetrics: PerformanceMetrics = {
    operationLatency: 0,
    cacheHitRate: 0,
    syncLatency: 0,
    compressionRatio: 0,
    errorRate: 0,
    activeConnections: 0
  };
  private healthStatus: HealthStatus = {
    isHealthy: true,
    lastCheck: Date.now(),
    issues: [],
    services: {
      database: true,
      cache: true,
      sync: true
    }
  };
  private thresholds = {
    latency: 1000,
    errorRate: 0.1,
    cacheHitRate: 0.8,
    compressionRatio: 0.5,
    activeConnections: 100
  };
  private contexts: Map<string, ContextConfig>;

  private constructor(config: ContextConfig) {
    super();
    this.config = config;
    this.cache = new ContextCache();
    this.merger = new ContextMerger();
    this.contextStack.push({
      ...config,
      id: this.generateUniqueId(),
      tags: config.tags || []
    });
    this.contexts = new Map();
    if (config.cloudSync) {
      this.initializeCloud(config);
    }
    this.initializeComponents();
    this.startHealthCheck();
  }

  private initializeComponents(): void {
    if (this.config.autoCommit) {
      this.autoCommit = new AutoCommit(this.config);
    }
  }

  public static getInstance(config?: ContextConfig): ContextManager {
    if (!ContextManager.instance) {
      if (!config) {
        throw new Error('Configuration required for initial ContextManager instantiation');
      }
      ContextManager.instance = new ContextManager(config);
    } else if (config) {
      ContextManager.instance.updateConfig(config);
    }
    return ContextManager.instance;
  }

  public static resetInstance(): void {
    ContextManager.instance = null;
  }

  private updateConfig(newConfig: ContextConfig): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeComponents();
  }

  public getConfig(): ContextConfig {
    return { ...this.config };
  }

  public pushContext(config: ContextConfig): void {
    this.contextStack.push({
      ...config,
      tags: config.tags || [],
      id: config.id || this.generateUniqueId()
    });
  }

  public popContext(): ContextConfig {
    if (this.contextStack.length <= 1) {
      throw new Error('Cannot pop the last context');
    }
    const popped = this.contextStack.pop();
    if (!popped) {
      throw new Error('No context to pop');
    }
    return popped;
  }

  public getCurrentContext(): ContextConfig {
    if (this.contextStack.length === 0) {
      throw new Error('No active context');
    }
    return this.contextStack[this.contextStack.length - 1];
  }

  public async syncWithCloud(data: any): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Cloud sync is not configured');
    }

    try {
      const contextData = {
        ...this.getCurrentContext(),
        timestamp: new Date().toISOString()
      };

      await this.supabaseClient
        .from('contexts')
        .upsert([contextData]);

    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to sync with cloud: ${error.message}`);
      }
      throw new Error('Failed to sync with cloud: Unknown error');
    }
  }

  public async syncContextStackToCloud(): Promise<void> {
    if (!this.config.cloudSync) {
      return; // Don't throw if cloud sync is disabled
    }
    
    if (!this.supabaseClient) {
      this.supabaseClient = createClient(this.config.supabaseUrl, this.config.supabaseKey);
    }

    try {
      await this.supabaseClient
        .from('contexts')
        .upsert(this.contextStack);
      
      // Clear pending changes after successful sync
      this.pendingChanges = [];
    } catch (error) {
      this.handleSyncError(error);
      throw error;
    }
  }

  public async loadContextStackFromCloud(): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Cloud sync not configured');
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('contexts')
        .select('*');
        
      if (error) throw error;
      if (data) {
        this.contextStack = data;
        // Also update the contexts map
        this.contexts = new Map(data.map(ctx => [ctx.id!, ctx]));
      }
    } catch (error) {
      console.error('Failed to load context stack:', error);
      throw error;
    }
  }

  public async performAutoCommit(): Promise<void> {
    if (!this.autoCommit) {
      throw new Error('Auto-commit is not configured');
    }

    try {
      await this.autoCommit.checkAndCommit();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Auto-commit failed: ${error.message}`);
      }
      throw new Error('Auto-commit failed: Unknown error');
    }
  }

  public async saveState(): Promise<void> {
    const statePath = path.join(this.config.workspaceRoot, '.repofm', 'context.json');
    await fs.ensureDir(path.dirname(statePath));
    await fs.writeJson(statePath, {
      config: this.config,
      contextStack: this.contextStack,
      timestamp: new Date().toISOString()
    });
  }

  public async loadState(): Promise<void> {
    const statePath = path.join(this.config.workspaceRoot, '.repofm', 'context.json');
    if (await fs.pathExists(statePath)) {
      const state = await fs.readJson(statePath);
      this.updateConfig(state.config);
      this.contextStack = state.contextStack || [];
    }
  }

  public async validatePath(path: string): Promise<boolean> {
    const context = this.getCurrentContext();
    const relativePath = path.replace(context.workspaceRoot, '');
    return !this.isPathExcluded(relativePath);
  }

  public isPathExcluded(filePath: string): boolean {
    const context = this.getCurrentContext();
    const relativePath = path.relative(context.workspaceRoot, filePath);
    
    return context.excludePatterns?.some(pattern => 
      this.matchPattern(relativePath, pattern)
    ) || false;
  }

  private matchPattern(filePath: string, pattern: string): boolean {
    const context = this.getCurrentContext();
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`, context.ignoreCase ? 'i' : '').test(filePath);
  }

  public searchContexts(query: {
    tags?: string[],
    type?: 'project' | 'workspace' | 'repository',
    metadata?: Record<string, any>
  }): ContextConfig[] {
    return this.contextStack.filter(context => {
      const matchesTags = !query.tags || query.tags.every(tag => context.tags?.includes(tag));
      const matchesType = !query.type || context.contextType === query.type;
      const matchesMetadata = !query.metadata || Object.entries(query.metadata)
        .every(([key, value]) => context.metadata?.[key] === value);
      
      return matchesTags && matchesType && matchesMetadata;
    });
  }

  public saveSnapshot(name: string): void {
    this.snapshots.set(name, [...this.contextStack]);
  }

  public restoreSnapshot(name: string): boolean {
    const snapshot = this.snapshots.get(name);
    if (snapshot) {
      this.contextStack = [...snapshot];
      return true;
    }
    return false;
  }

  public listSnapshots(): string[] {
    return Array.from(this.snapshots.keys());
  }

  public startAutoSync(interval: number = 5000): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = setInterval(async () => {
      try {
        await this.syncContextStackToCloud();
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, interval);
  }

  public stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  public updateContextConfig(contextId: string, config: Partial<ContextConfig>, options: UpdateContextOptions = {}): void {
    const context = this.findContextById(contextId);
    if (!context) {
      throw new repofmError(`Context with id ${contextId} not found`);
    }

    const updatedContext = { ...context, ...config };
    
    if (options.temporary) {
      this.addTemporaryContext(updatedContext, options.expiresIn);
    } else {
      this.updateContext(contextId, updatedContext);
    }

    if (!this.syncStatus.isOnline) {
      this.addPendingChange({
        id: contextId,
        type: 'update',
        data: updatedContext
      });
    }

    if (options.propagateChanges) {
      this.propagateChanges(contextId, config);
    }
  }

  private updateContext(contextId: string, updatedContext: ContextConfig): void {
    const index = this.contextStack.findIndex(ctx => ctx.id === contextId);
    if (index !== -1) {
      this.contextStack[index] = updatedContext;
    }
  }

  private addTemporaryContext(context: ContextConfig, expiresIn?: number): void {
    // 实现临时上下文逻辑
    const timeout = expiresIn || 3600000; // 默认1小时
    this.contextStack.push(context);
    setTimeout(() => {
      this.contextStack = this.contextStack.filter(ctx => ctx.id !== context.id);
    }, timeout);
  }

  private propagateChanges(contextId: string, changes: Partial<ContextConfig>): void {
    // 实现变更传播逻辑
    const childContexts = this.contextStack.filter(ctx => ctx.parentId === contextId);
    childContexts.forEach(child => {
      this.updateContextConfig(child.id!, changes);
    });
  }

  public findContextById(id: string): ContextConfig | undefined {
    return this.contextStack.find(context => context.id === id);
  }

  public addExcludePattern(pattern: string): void {
    if (!this.config.excludePatterns) {
      this.config.excludePatterns = [];
    }
    this.config.excludePatterns.push(pattern);
  }

  public removeExcludePattern(pattern: string): void {
    if (this.config.excludePatterns) {
      this.config.excludePatterns = this.config.excludePatterns.filter(p => p !== pattern);
    }
  }

  public adjustMaxDepth(depth: number): void {
    this.config.maxDepth = depth;
  }

  public cleanupInactiveContexts(olderThan: number): void {
    const now = Date.now();
    this.contextStack = this.contextStack.filter(context => {
      const lastAccessed = context.metadata?.lastAccessed as number;
      return !lastAccessed || (now - lastAccessed) < olderThan;
    });
  }

  public optimizeStack(): void {
    // Remove duplicate contexts based on workspaceRoot and priority
    const seen = new Set<string>();
    this.contextStack = this.contextStack.filter(context => {
      const key = `${context.workspaceRoot}-${context.priority || 0}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Sort by priority if present
    this.contextStack.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  public createChildContext(parentId: string, config: Partial<ContextConfig>): string | undefined {
    const parentContext = this.findContextById(parentId);
    if (!parentContext) return undefined;

    const childConfig: ContextConfig = {
      ...parentContext,
      ...config,
      parentId,
      id: this.generateUniqueId()
    };

    this.contextStack.push(childConfig);
    return childConfig.id;
  }

  private generateUniqueId(): string {
    return `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async handleRealtimeUpdate(update: Partial<ContextConfig>): Promise<void> {
    try {
      let existingContext = this.findContextById(update.id!);
      if (!existingContext) {
        // Create new context if it doesn't exist
        existingContext = {
          workspaceRoot: update.workspaceRoot || '',
          cloudSync: true,
          supabaseUrl: this.config.supabaseUrl,
          supabaseKey: this.config.supabaseKey,
          version: '1',
          ...update
        };
        this.contextStack.push(existingContext);
      } else {
        Object.assign(existingContext, update);
      }
      await this.syncContextStackToCloud();
    } catch (error) {
      this.handleSyncError(error);
    }
  }

  public async startRealtimeSync(): Promise<void> {
    if (!this.supabaseClient || this.realtimeSubscription) return;

    this.realtimeSubscription = this.supabaseClient
      .channel('contexts')
      .on(
        'postgres_changes' as any, // Temporary type assertion
        { event: '*', schema: 'public', table: 'contexts' },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            this.handleContextDeletion(payload.old.id);
          } else if (payload.eventType === 'UPDATE') {
            this.handleRealtimeUpdate(payload.new);
          }
        }
      )
      .subscribe();
  }

  public stopRealtimeSync(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
  }

  public addPendingChange(change: Omit<PendingChange, 'timestamp'>): void {
    this.pendingChanges.push({
      ...change,
      timestamp: Date.now(),
      retryCount: 0
    });
    this.syncStatus.pendingChanges = this.pendingChanges.length;
  }

  public async syncPendingChanges(): Promise<void> {
    if (!this.syncStatus.isOnline || this.pendingChanges.length === 0) return;

    const changes = [...this.pendingChanges];
    this.pendingChanges = []; // Clear pending changes before attempting sync

    try {
      await this.syncContextStackToCloud();
    } catch (error) {
      // If sync fails, restore pending changes that haven't exceeded retry limit
      this.pendingChanges = changes.filter(change => 
        !change.retryCount || change.retryCount < 3
      ).map(change => ({
        ...change,
        retryCount: (change.retryCount || 0) + 1
      }));
      throw error;
    }
  }

  private handleSyncError(error: any): void {
    const syncError = new ContextSyncError(
      error.message || 'Sync failed',
      error.code || SyncErrorCode.UNKNOWN_ERROR,
      error.code !== SyncErrorCode.AUTH_ERROR
    );

    // Clear existing errors before adding new one
    this.syncStatus.syncErrors = [syncError];
    this.syncStatus.isOnline = false;

    // Trigger retry mechanism
    setTimeout(() => this.retrySync(), 5000);
  }

  private async retrySync(): Promise<void> {
    try {
      await this.syncContextStackToCloud();
      this.syncStatus.isOnline = true;
      this.syncStatus.syncErrors = [];
    } catch (error) {
      console.error('Retry sync failed:', error);
      // Don't throw here to prevent unhandled promise rejection
    }
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public getPendingChanges(): PendingChange[] {
    return [...this.pendingChanges];
  }

  private async handleContextDeletion(contextId: string): Promise<void> {
    const index = this.contextStack.findIndex(ctx => ctx.id === contextId);
    if (index !== -1) {
      this.contextStack.splice(index, 1);
      await this.syncContextStackToCloud();
    }
  }

  // 批量处理优化
  private async processBatchQueue(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    const startTime = Date.now();
    try {
      await this.supabaseClient!
        .from('contexts')
        .upsert(batch.map(change => change.data));
      
      this.updateMetrics(startTime);
    } catch (error) {
      // Ensure error is Error type before passing to handler
      if (error instanceof Error) {
        this.handleBatchError(error, batch);
      } else {
        this.handleBatchError(new Error('Unknown error occurred'), batch);
      }
    }
  }

  // 版本控制
  private async createVersion(contextId: string, changes: Partial<ContextConfig>): Promise<void> {
    const versions = this.versionHistory.get(contextId) || [];
    const newVersion: ContextVersion = {
      id: contextId,
      version: versions.length + 1,
      timestamp: Date.now(),
      changes
    };
    
    versions.push(newVersion);
    this.versionHistory.set(contextId, versions);
    
    await this.supabaseClient!
      .from('context_versions')
      .insert(newVersion);
  }

  // 冲突解决增强
  private async resolveConflict(localContext: ContextConfig, remoteContext: ContextConfig): Promise<ContextConfig> {
    if (remoteContext.version! > localContext.version!) {
      return remoteContext;
    }
    
    // 合并策略
    return {
      ...localContext,
      ...remoteContext,
      metadata: {
        ...localContext.metadata,
        ...remoteContext.metadata
      },
      version: String(Math.max(Number(localContext.version!), Number(remoteContext.version!)) + 1)
    };
  }

  // 性能监控
  private updateMetrics(startTime: number): void {
    const duration = Date.now() - startTime;
    this.metrics.syncDuration = duration;
    this.metrics.lastSuccessful = Date.now();
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * 9 + duration) / 10; // 移动平均
  }

  // 事务支持
  public async executeTransaction(operations: Array<() => Promise<void>>): Promise<void> {
    try {
      for (const operation of operations) {
        await operation();
      }
    } catch (error) {
      throw new ContextSyncError(
        'Transaction failed',
        SyncErrorCode.TRANSACTION_ERROR
      );
    }
  }

  // 批量更新优化
  public async batchUpdate(changes: PendingChange[]): Promise<void> {
    this.batchQueue.push(...changes);
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processBatchQueue();
    }, 100); // 100ms 批处理窗口
  }

  // 性能监控 API
  public getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  // 版本历史
  public getVersionHistory(contextId: string): ContextVersion[] {
    return this.versionHistory.get(contextId) || [];
  }

  // 增量同步
  private async syncIncremental(): Promise<void> {
    const lastSyncTimestamp = this.syncStatus.lastSync;
    
    const { data } = await this.supabaseClient!
      .from('contexts')
      .select('*')
      .gt('updated_at', new Date(lastSyncTimestamp).toISOString());

    if (data) {
      for (const context of data) {
        await this.handleIncrementalUpdate(context);
      }
    }
  }
  handleIncrementalUpdate(context: any) {
    throw new Error('Method not implemented.');
  }

  // 压缩传输
  private async compressAndSync(data: any): Promise<void> {
    if (!this.compressionEnabled) {
      await this.syncWithCloud(data);
      return;
    }

    const compressed = await this.compress(data);
    await this.syncWithCloud(compressed);
  }

  // 预加载
  public async preloadContexts(ids: string[]): Promise<void> {
    const uncachedIds = [];
    
    for (const id of ids) {
      const cached = await this.cache.get(id);
      if (!cached) {
        uncachedIds.push(id);
      }
    }

    if (uncachedIds.length > 0) {
      const { data } = await this.supabaseClient!
        .from('contexts')
        .select('*')
        .in('id', uncachedIds);

      if (data) {
        await Promise.all(
          data.map(context => this.cache.set(context.id, context))
        );
      }
    }
  }

  // 安全验证
  private validateContext(context: ContextConfig): boolean {
    // 实现验证逻辑
    if (!context.id || !context.workspaceRoot) {
      throw new Error('Invalid context configuration');
    }

    // 检查敏感字段
    if (context.supabaseKey) {
      throw new Error('Security violation: Sensitive data exposed');
    }

    return true;
  }

  // 加密支持
  private async encryptSensitiveData(data: any): Promise<any> {
    // 实现加密逻辑
    return data; // 临时返回未加密数据
  }

  // 访问控制
  private async checkPermissions(operation: string, contextId: string): Promise<boolean> {
    // 实现权限检查逻辑
    return true; // 临时返回true
  }

  // 高级冲突解决
  private async resolveConflictAdvanced(local: ContextConfig, remote: ContextConfig): Promise<ContextConfig> {
    // 字段级别合并
    const merged = await ContextMerger.mergeFields(local, remote, MergeStrategy.SMART);
    
    // 触发冲突通知
    if (this.hasConflicts(merged)) {
      this.notifyConflict({
        contextId: local.id!,
        local,
        remote,
        resolved: merged
      });
    }

    return merged;
  }

  // 性能优化方法
  public enableCompression(enabled: boolean = true): void {
    this.compressionEnabled = enabled;
  }

  private async compress(data: any): Promise<any> {
    // 实现压缩逻辑
    return data; // 临时返回未压缩数据
  }

  // 缓存管理
  public async invalidateCache(contextId: string): Promise<void> {
    if (this.cache) {
      await this.cache.invalidate?.(contextId);
    }
  }

  public async clearCache(): Promise<void> {
    if (this.cache) {
      await this.cache.clear?.();
    }
  }

  private startHealthCheck(): void {
    // 实现健康检查逻辑
    // 例如，每分钟检查一次
    setInterval(() => {
      this.checkHealth();
    }, 60000);
  }

  private checkHealth(): void {
    // 实现健康检查逻辑
    // 例如，检查数据库连接、缓存状态、同步状态等
    // 如果发现问题，记录到 healthStatus
    this.healthStatus.lastCheck = Date.now();
    this.healthStatus.issues = [];
    this.healthStatus.services = {
      database: true,
      cache: true,
      sync: true
    };

    if (this.metrics.errorRate > this.thresholds.errorRate) {
      this.healthStatus.issues.push(`High error rate detected: ${this.metrics.errorRate}`);
      this.healthStatus.services.sync = false;
    }

    if (this.metrics.operationLatency > this.thresholds.latency) {
      this.healthStatus.issues.push(`High latency detected: ${this.metrics.operationLatency}ms`);
      this.healthStatus.services.sync = false;
    }

    if (this.metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      this.healthStatus.issues.push(`Low cache hit rate detected: ${this.metrics.cacheHitRate}`);
      this.healthStatus.services.cache = false;
    }

    if (this.metrics.syncLatency > this.thresholds.latency) {
      this.healthStatus.issues.push(`High sync latency detected: ${this.metrics.syncLatency}ms`);
      this.healthStatus.services.sync = false;
    }

    if (this.metrics.compressionRatio < this.thresholds.compressionRatio) {
      this.healthStatus.issues.push(`Low compression ratio detected: ${this.metrics.compressionRatio}`);
      this.healthStatus.services.sync = false;
    }

    if (this.metrics.activeConnections > this.thresholds.activeConnections) {
      this.healthStatus.issues.push(`High active connections detected: ${this.metrics.activeConnections}`);
      this.healthStatus.services.sync = false;
    }

    if (this.healthStatus.issues.length > 0) {
      this.emit('alert', {
        type: 'health_check',
        message: `Health check failed: ${this.healthStatus.issues.join(', ')}`
      });
    }
  }

  public async updateNetworkState(isOnline: boolean): Promise<void> {
    const wasOffline = !this.syncStatus.isOnline;
    this.syncStatus.isOnline = isOnline;
    
    if (isOnline && wasOffline) {
      await this.syncPendingChanges().catch(error => {
        console.error('Failed to sync pending changes:', error);
      });
    }
  }

  public getAllContexts(): ContextConfig[] {
    return Array.from(this.contexts.values());
  }

  private async handleBatchError(error: Error, batch: PendingChange[]): Promise<void> {
    this.metrics.errorRate++;
    this.emit('sync-error', {
      code: SyncErrorCode.TRANSACTION_ERROR,
      message: error.message,
      timestamp: Date.now()
    });
  }

  private hasConflicts(merged: any): boolean {
    return merged.conflicts && merged.conflicts.length > 0;
  }

  private notifyConflict(conflict: any): void {
    this.emit('conflict', conflict);
  }


  private async handleMergeConflict(local: ContextConfig, remote: ContextConfig): Promise<ContextConfig> {
    const merged = await ContextMerger.mergeFields(local, remote, MergeStrategy.SMART);
    return merged;
  }

  private async mergeContexts(localContext: ContextConfig, remoteContext: ContextConfig): Promise<ContextConfig> {
    // Convert version strings to numbers, handle them, then convert back to string
    const localVer = parseInt(localContext.version || '0', 10);
    const remoteVer = parseInt(remoteContext.version || '0', 10);
    const newVersion = String(Math.max(localVer, remoteVer) + 1);
    
    return {
      ...localContext,
      ...remoteContext,
      version: newVersion,
      metadata: {
        ...localContext.metadata,
        ...remoteContext.metadata
      }
    };
  }

  private async initializeCloud(config: ContextConfig): Promise<void> {
    // Only create client if URLs are provided
    if (config.supabaseUrl && config.supabaseKey) {
      this.supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    }
  }
}

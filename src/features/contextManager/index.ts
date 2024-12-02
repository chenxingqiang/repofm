import { ContextConfig, PerformanceMetrics, CacheEntry } from './types';

export class ContextManager {
  private static instance: ContextManager | null = null;
  private config: ContextConfig;
  private cache: Map<string, CacheEntry<any>>;
  private metrics: PerformanceMetrics;

  private constructor(config: ContextConfig) {
    this.config = config;
    this.cache = new Map();
    this.metrics = {
      operationLatency: 0,
      cacheHitRate: 0,
      requestCount: 0
    };
  }

  public static getInstance(config: ContextConfig): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager(config);
    }
    return ContextManager.instance;
  }

  public static resetInstance(): void {
    ContextManager.instance = null;
  }

  public setCacheValue<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  public getCacheValue<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }

  public recordOperationLatency(latency: number): void {
    this.metrics.operationLatency = latency;
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getConfig(): ContextConfig {
    return { ...this.config };
  }
}

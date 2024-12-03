import type { Config } from '../../types/config.js';
import type { CodeContext } from '../../types/context.js';
import { extractCodeContext } from './implementation.js';
import { PersistentCache } from './cache/persistentCache.js';

export interface ICodeContextManager {
  getContext(target: string, type: string, depth: number): Promise<CodeContext>;
  clearCache(): Promise<void>;
}

export class CodeContextManager implements ICodeContextManager {
  private static _instance: CodeContextManager | null = null;
  private _metrics: { operationLatency: number };
  private _config: Config;
  private _contextStack: Config[];
  private cache: PersistentCache;

  private constructor(config: Config) {
    this._config = {
      ...config,
      ignore: {
        ...config.ignore,
        useDefaultPatterns: true,
        customPatterns: config.ignore.customPatterns || [],
        excludePatterns: config.ignore.excludePatterns || ['node_modules/**', '*.log']
      }
    };
    this._metrics = {
      operationLatency: 0
    };
    this._contextStack = [];
    this.cache = new PersistentCache(this._config);
  }

  public static getInstance(config?: Config): CodeContextManager {
    if (!this._instance) {
      if (!config) {
        throw new Error('Initial configuration is required to create CodeContextManager');
      }
      this._instance = new CodeContextManager(config);
    }
    return this._instance;
  }

  public getConfig(): Config {
    return { ...this._config };
  }

  public pushContext(context: Config): void {
    this._contextStack.push({ ...this._config });
    this._config = {
      ...context,
      ignore: {
        ...context.ignore,
        useDefaultPatterns: true,
        customPatterns: context.ignore.customPatterns,
        excludePatterns: context.ignore.excludePatterns
      }
    };
  }

  public popContext(): void {
    if (this._contextStack.length > 0) {
      this._config = this._contextStack.pop()!;
    }
  }

  public async getContext(target: string, type: string, depth: number): Promise<CodeContext> {
    const cacheKey = `${target}:${type}:${depth}`;
    
    // Try to get from cache first
    const cachedContext = await this.cache.get(cacheKey);
    if (cachedContext) {
      return cachedContext;
    }

    // If not in cache, extract context
    const context = await extractCodeContext(target, type, depth, this._config);

    // Store in cache for future use
    await this.cache.set(cacheKey, context);

    return context;
  }

  public async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  public recordLatency(latency: number): void {
    this._metrics.operationLatency = latency;
  }

  public withContext<T>(context: Config, operation: () => T): T {
    try {
      this.pushContext(context);
      return operation();
    } finally {
      this.popContext();
    }
  }
}
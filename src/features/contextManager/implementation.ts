import type { 
  ContextConfig, 
  PerformanceMetrics, 
  ICodeContextManager,
  ICodeContextManagerConstructor 
} from './types';

export class CodeContextManager implements ICodeContextManager {
  private static _instance: CodeContextManager | null = null;
  private _cache: Map<string, any>;
  private _metrics: PerformanceMetrics;
  private _config: ContextConfig;
  private _contextStack: ContextConfig[];

  private constructor(config: ContextConfig) {
    this._config = {
      ...config,
      ignoreCase: config.ignoreCase ?? true,
      excludePatterns: config.excludePatterns || ['node_modules/**', '*.log']
    };
    this._cache = new Map();
    this._metrics = {
      operationLatency: 0
    };
    this._contextStack = [];
  }

  public static getInstance(config?: ContextConfig): CodeContextManager {
    if (!CodeContextManager._instance) {
      if (!config) {
        throw new Error('CodeContextManager not initialized');
      }
      CodeContextManager._instance = new CodeContextManager(config);
    }
    return CodeContextManager._instance;
  }

  public static resetInstance(): void {
    if (CodeContextManager._instance) {
      CodeContextManager._instance._cache.clear();
      CodeContextManager._instance._contextStack = [];
    }
    CodeContextManager._instance = null;
  }

  public getConfig(): ContextConfig {
    return { ...this._config };
  }

  public setCacheValue(key: string, value: any): void {
    this._cache.set(key, value);
  }

  public getCacheValue(key: string): any {
    return this._cache.get(key);
  }

  public recordOperationLatency(latency: number): void {
    this._metrics.operationLatency = latency;
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this._metrics };
  }

  public pushContext(context: Partial<ContextConfig>): void {
    this._contextStack.push({ ...this._config });
    this._config = { ...this._config, ...context };
  }

  public popContext(): ContextConfig | undefined {
    const previousContext = this._contextStack.pop();
    if (previousContext) {
      this._config = previousContext;
      return previousContext;
    }
    return undefined;
  }

  public getCurrentContext(): ContextConfig {
    return { ...this._config };
  }

  public isValidSourceFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    for (const pattern of this._config.excludePatterns) {
      // Handle special patterns first
      if (pattern === 'node_modules/**' && (normalizedPath.startsWith('node_modules/') || normalizedPath.includes('/node_modules/'))) {
        return false;
      }

      // Handle brace expansion patterns
      if (pattern.includes('{') && pattern.includes('}')) {
        const parts = pattern.match(/\{([^}]+)\}/);
        if (parts) {
          const options = parts[1].split(',');
          const basePattern = pattern.replace(/\{[^}]+\}/, '([^/]*)');
          for (const option of options) {
            const fullPattern = basePattern.replace(/\([^/]*\)/, option.trim());
            if (this.matchPattern(normalizedPath, fullPattern)) {
              return false;
            }
          }
          continue;
        }
      }

      // Handle other patterns
      if (this.matchPattern(normalizedPath, pattern)) {
        return false;
      }
    }
    return true;
  }

  private matchPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');

    try {
      // Handle directory patterns
      if (pattern.endsWith('/**')) {
        const dirPattern = regexPattern.replace(/\/\.\*$/, '(?:/.*)?');
        const dirRegex = new RegExp(dirPattern, this._config.ignoreCase ? 'i' : '');
        return dirRegex.test(filePath);
      }

      // Handle normal patterns
      const regex = new RegExp(regexPattern, this._config.ignoreCase ? 'i' : '');
      return regex.test(filePath);
    } catch {
      return false;
    }
  }

  public async withTemporaryContext<T>(
    context: Partial<ContextConfig>, 
    callback: () => Promise<T>
  ): Promise<T> {
    this.pushContext(context);
    try {
      return await callback();
    } finally {
      this.popContext();
    }
  }
}

export const contextManagerStatics: ICodeContextManagerConstructor = {
  getInstance: CodeContextManager.getInstance.bind(CodeContextManager),
  resetInstance: CodeContextManager.resetInstance.bind(CodeContextManager)
};
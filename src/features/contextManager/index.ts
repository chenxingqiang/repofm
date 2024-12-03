import { ContextConfig } from './types';
import { minimatch } from 'minimatch';

class CodeContextManager {
  private static instance: CodeContextManager | null = null;
  private config: ContextConfig;
  private contextStack: ContextConfig[] = [];
  private cache: Map<string, any> = new Map();
  private performanceMetrics: { operationLatency: number } = { operationLatency: 0 };

  private constructor(config: ContextConfig) {
    if (!config?.workspaceRoot) {
      throw new Error('Workspace root is required for initialization');
    }
    this.config = config;
  }

  public static getInstance(config?: ContextConfig): CodeContextManager {
    if (!CodeContextManager.instance && config) {
      CodeContextManager.instance = new CodeContextManager(config);
    } else if (!CodeContextManager.instance && !config) {
      throw new Error('Workspace root is required for initialization');
    }
    return CodeContextManager.instance!;
  }

  public static resetInstance(): void {
    CodeContextManager.instance = null;
  }

  public getConfig(): ContextConfig {
    return this.config;
  }

  public setCacheValue(key: string, value: any): void {
    this.cache.set(key, value);
  }

  public getCacheValue(key: string): any {
    return this.cache.get(key);
  }

  public recordOperationLatency(latency: number): void {
    this.performanceMetrics.operationLatency = latency;
  }

  public getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  public pushContext(newContext: Partial<ContextConfig>): void {
    this.contextStack.push(this.config);
    this.config = { ...this.config, ...newContext };
  }

  public popContext(): void {
    const previousContext = this.contextStack.pop();
    if (previousContext) {
      this.config = previousContext;
    }
  }

  public async withTemporaryContext<T>(
    tempContext: Partial<ContextConfig>,
    operation: () => Promise<T>
  ): Promise<T> {
    this.pushContext(tempContext);
    try {
      return await operation();
    } finally {
      this.popContext();
    }
  }

  public isValidSourceFile(filePath: string): boolean {
    const { excludePatterns = [] } = this.config;
    
    // Normalize path separators to forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Check if the path matches any exclude pattern
    return !excludePatterns.some(pattern => {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      return minimatch(normalizedPath, normalizedPattern, {
        dot: true,
        nocase: this.config.ignoreCase,
        matchBase: false,
        windowsPathsNoEscape: true
      });
    });
  }
}

export { CodeContextManager };
export default CodeContextManager;
import fs from 'node:fs/promises';
import path from 'node:path';
import { Config, PerformanceMetrics, ICodeContextManager } from '../../types/config.js';
import { CodeContext } from '../../types/context.js';
import { extractContext } from '../../core/contextExtractor.js';

export async function extractCodeContext(
  target: string, 
  type: string, 
  depth: number, 
  config: Config
): Promise<CodeContext> {
  try {
    const absoluteTarget = path.isAbsolute(target) 
      ? target 
      : path.resolve(config.cwd, target);

    return await extractContext({
      target: absoluteTarget,
      type,
      depth,
      cwd: config.cwd,
      ignore: {
        ...config.ignore,
        useDefaultPatterns: true,
        customPatterns: config.ignore.customPatterns,
        excludePatterns: config.ignore.excludePatterns
      },
      output: config.output
    });
  } catch (error) {
    console.error('Error extracting code context:', error);
    throw error;
  }
}

export { Config };

export class CodeContextManager implements ICodeContextManager {
  private static instance: CodeContextManager | null = null;
  private config: any;
  private contextStack: any[] = [];

  private constructor(config?: any) {
    if (!config) {
      throw new Error('Configuration is required');
    }
    this.config = config;
  }

  public static getInstance(config?: any): CodeContextManager {
    if (!this.instance && config) {
      this.instance = new CodeContextManager(config);
    }
    return this.instance!;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  public getConfig(): Config {
    return { ...this.config };
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.config.metrics };
  }

  public setCacheValue(key: string, value: any): void {
    this.config.cache.set(key, value);
  }

  public getCacheValue(key: string): any {
    return this.config.cache.get(key);
  }

  public recordOperationLatency(latency: number): void {
    this.config.metrics.operationLatency = latency;
  }

  public pushContext(context: Config): void {
    this.contextStack.push({ ...this.config });
    this.config = {
      ...context,
      ignore: {
        ...context.ignore,
        useDefaultPatterns: true,
        customPatterns: context.ignore.customPatterns,
        excludePatterns: context.ignore.excludePatterns
      }
    };
  }

  public popContext(): Config | undefined {
    const previousContext = this.contextStack.pop();
    if (previousContext) {
      this.config = previousContext;
      return previousContext;
    }
    return undefined;
  }

  public getCurrentContext(): Config {
    return { ...this.config };
  }

  public isValidSourceFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    const excludePatterns = this.config.ignore.excludePatterns || [];
    const customPatterns = this.config.ignore.customPatterns || [];
    const allPatterns = [...excludePatterns, ...customPatterns];

    for (const pattern of allPatterns) {
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
        }
      }

      // Handle standard glob patterns
      if (this.matchPattern(normalizedPath, pattern)) {
        return false;
      }
    }

    return true;
  }

  private matchPattern(path: string, pattern: string): boolean {
    // Simple pattern matching logic
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  public async withTemporaryContext<T>(
    context: Config, 
    callback: () => Promise<T>
  ): Promise<T> {
    this.pushContext(context);
    try {
      return await callback();
    } finally {
      this.popContext();
    }
  }

  public async getContext(target: string, type: string, depth: number): Promise<CodeContext> {
    const cacheKey = `${target}:${type}:${depth}`;
    
    // Try to get from cache first
    const cachedContext = await this.getCacheValue(cacheKey);
    if (cachedContext) {
      return cachedContext;
    }

    // If not in cache, extract context
    const context = await extractCodeContext(target, type, depth, this.config);

    // Store in cache for future use
    await this.setCacheValue(cacheKey, context);

    return context;
  }

  public async clearCache(): Promise<void> {
    this.config.cache.clear();
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

export default CodeContextManager;
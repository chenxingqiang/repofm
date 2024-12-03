import { ContextConfig } from "./types";
import { ICodeContextManager } from './types';

import minimatch = require('minimatch');
import { Minimatch } from 'minimatch';

export class CodeContextManager implements ICodeContextManager {
  private static instance: CodeContextManager | null = null;
  private initialConfig: ContextConfig;
  private contextStack: ContextConfig[] = [];
  private cache = new Map<string, any>();
  private performanceMetrics = {
    operationLatency: 0,
  };

  private constructor(config: ContextConfig) {
    this.initialConfig = {
      workspaceRoot: config.workspaceRoot,
      excludePatterns: config.excludePatterns || [
        '**/node_modules/**',
        '**/*.log',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      maxDepth: config.maxDepth || 5,
      ignoreCase: config.ignoreCase ?? true,
    };
    this.contextStack = [{ ...this.initialConfig }];
  }

  public static getInstance(config?: ContextConfig): CodeContextManager {
    if (!CodeContextManager.instance) {
      if (!config?.workspaceRoot) {
        throw new Error('Workspace root is required for initialization');
      }
      CodeContextManager.instance = new CodeContextManager(config);
    }
    return CodeContextManager.instance;
  }

  public static resetInstance(): void {
    CodeContextManager.instance = null;
  }

  getConfig(): ContextConfig {
    return this.getCurrentContext();
  }

  getCurrentContext(): ContextConfig {
    return this.contextStack.length > 0
      ? { ...this.contextStack[this.contextStack.length - 1] }
      : { ...this.initialConfig };
  }

  pushContext(newContext: Partial<ContextConfig>): void {
    const currentContext = this.getCurrentContext();
    const mergedContext = {
      ...currentContext,
      ...newContext,
    };
    this.contextStack.push(mergedContext);
  }

  popContext(): void {
    if (this.contextStack.length > 1) {
      this.contextStack.pop();
    }
  }

  isValidSourceFile(filePath: string): boolean {
    const { excludePatterns, ignoreCase } = this.getCurrentContext();
    
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    return !excludePatterns.some(pattern => {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      
      const matcher = new Minimatch(normalizedPattern, {
        nocase: ignoreCase,
        dot: true,
        matchBase: false,
        noglobstar: false
      });
      
      return matcher.match(normalizedPath);
    });
  }

  async withTemporaryContext<T>(
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

  // Cache methods
  setCacheValue(key: string, value: any): void {
    this.cache.set(key, value);
  }

  getCacheValue(key: string): any {
    return this.cache.get(key);
  }

  // Performance methods
  recordOperationLatency(latency: number): void {
    this.performanceMetrics.operationLatency = latency;
  }

  getPerformanceMetrics(): { operationLatency: number } {
    return { ...this.performanceMetrics };
  }
} 
import type { Config } from '../../types/config.js';

export interface ContextConfig {
  workspaceRoot: string;
  excludePatterns: string[];
  maxDepth: number;
  ignoreCase?: boolean;
}

export interface PerformanceMetrics {
  operationLatency: number;
}

export enum MergeStrategy {
  MERGE = 'MERGE',
  REPLACE = 'REPLACE',
  CUSTOM = 'CUSTOM',
  OVERRIDE = 'OVERRIDE',
  APPEND = 'APPEND',
  SKIP = 'SKIP'
}

export interface PersistentCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
}

export interface ICodeContextManager {
  getConfig(): Config;
  getCurrentContext(): Config;
  pushContext(context: Partial<Config>): void;
  popContext(): Config | undefined;
  isValidSourceFile(filePath: string): boolean;
  withTemporaryContext<T>(context: Partial<Config>, callback: () => Promise<T>): Promise<T>;
  setCacheValue(key: string, value: any): void;
  getCacheValue(key: string): any;
  recordOperationLatency(latency: number): void;
  getPerformanceMetrics(): { operationLatency: number };
}

export interface ICodeContextManagerConstructor {
  getInstance(config?: Config): ICodeContextManager;
  resetInstance(): void;
}

export type ContextManagerStatics = ICodeContextManagerConstructor;
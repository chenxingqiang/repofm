export interface ContextConfig {
  workspaceRoot: string;
  excludePatterns: string[];
  maxDepth: number;
  ignoreCase?: boolean;
}

export interface PerformanceMetrics {
  operationLatency: number;
}

export interface ICodeContextManager {
  setCacheValue(arg0: string, arg1: string): unknown;
  getCacheValue(arg0: string): any;
  recordOperationLatency(arg0: number): unknown;
  getPerformanceMetrics(): unknown;
  getConfig(): ContextConfig;
  getCurrentContext(): ContextConfig;
  pushContext(context: Partial<ContextConfig>): void;
  popContext(): ContextConfig | undefined;
  isValidSourceFile(filePath: string): boolean;
  withTemporaryContext<T>(context: Partial<ContextConfig>, callback: () => Promise<T>): Promise<T>;
}

export interface ICodeContextManagerConstructor {
  getInstance(config?: ContextConfig): ICodeContextManager;
  resetInstance(): void;
}

export type ContextManagerStatics = ICodeContextManagerConstructor; 
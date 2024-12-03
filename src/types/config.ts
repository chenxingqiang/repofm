export interface IgnoreConfig {
  customPatterns: string[];
  useDefaultPatterns: boolean;
  useGitignore: boolean;
  excludePatterns: string[];
}

export interface SecurityConfig {
  enableSecurityCheck: boolean;
}

export interface OutputConfig {
  filePath: string;
  style: 'plain' | 'xml' | 'markdown';
  removeComments: boolean;
  removeEmptyLines: boolean;
  topFilesLength: number;
  showLineNumbers: boolean;
  copyToClipboard: boolean;
  headerText: string;
  instructionFilePath: string;
}

export interface Config {
  output: OutputConfig;
  include: string[];
  ignore: IgnoreConfig;
  security: SecurityConfig;
  cwd?: string;
}

export interface CliOptions {
  output?: string;
  copy?: boolean;
  security?: boolean;
  cwd?: string;
  global?: boolean;
}

export interface PerformanceMetrics {
  operationLatency: number;
}

export interface ICodeContextManager {
  getConfig(): Config;
  getCurrentContext(): Config;
  pushContext(context: Config): void;
  popContext(): Config | undefined;
  isValidSourceFile(filePath: string): boolean;
  withTemporaryContext<T>(
    context: Config, 
    callback: () => Promise<T>
  ): Promise<T>;
  setCacheValue(key: string, value: any): void;
  getCacheValue(key: string): any;
  recordOperationLatency(latency: number): void;
  getPerformanceMetrics(): PerformanceMetrics;
}

export interface ICodeContextManagerConstructor {
  getInstance(config?: Config): ICodeContextManager;
  resetInstance(): void;
}

// Helper function to normalize ignore config
export const normalizeIgnoreConfig = (
  ignore: string[] | IgnoreConfig
): IgnoreConfig => {
  if (Array.isArray(ignore)) {
    return {
      customPatterns: ignore,
      useDefaultPatterns: true,
      useGitignore: true,
      excludePatterns: [],
    };
  }
  return ignore;
};

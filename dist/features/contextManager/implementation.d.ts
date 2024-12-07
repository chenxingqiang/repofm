import type { Config } from '../../types/config.js';
import type { CodeContext } from '../../types/context.js';
import type { ICodeContextManager } from './types';
import { PerformanceMetrics } from './types';
export declare function extractCodeContext(target: string, type: string, depth: number, config: Config): Promise<CodeContext>;
export { Config };
export declare class CodeContextManager implements ICodeContextManager {
    private static instance;
    private config;
    private contextStack;
    private constructor();
    static getInstance(config?: any): CodeContextManager;
    static resetInstance(): void;
    getConfig(): Config;
    getPerformanceMetrics(): PerformanceMetrics;
    setCacheValue(key: string, value: any): void;
    getCacheValue(key: string): any;
    recordOperationLatency(latency: number): void;
    pushContext(context: Config): void;
    popContext(): Config | undefined;
    getCurrentContext(): Config;
    isValidSourceFile(filePath: string): boolean;
    private matchPattern;
    withTemporaryContext<T>(context: Config, callback: () => Promise<T>): Promise<T>;
    getContext(target: string, type: string, depth: number): Promise<CodeContext>;
    clearCache(): Promise<void>;
    withContext<T>(context: Config, operation: () => T): T;
}
export default CodeContextManager;

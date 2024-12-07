import { ContextConfig } from './types';
declare class CodeContextManager {
    private static instance;
    private config;
    private contextStack;
    private cache;
    private performanceMetrics;
    private constructor();
    static getInstance(config?: ContextConfig): CodeContextManager;
    static resetInstance(): void;
    getConfig(): ContextConfig;
    setCacheValue(key: string, value: any): void;
    getCacheValue(key: string): any;
    recordOperationLatency(latency: number): void;
    getPerformanceMetrics(): {
        operationLatency: number;
    };
    pushContext(newContext: Partial<ContextConfig>): void;
    popContext(): void;
    withTemporaryContext<T>(tempContext: Partial<ContextConfig>, operation: () => Promise<T>): Promise<T>;
    isValidSourceFile(filePath: string): boolean;
}
export { CodeContextManager };
export default CodeContextManager;

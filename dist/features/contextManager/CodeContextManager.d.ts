import type { Config } from '../../types/config.js';
import type { CodeContext } from '../../types/context.js';
export interface ICodeContextManager {
    getContext(target: string, type: string, depth: number): Promise<CodeContext>;
    clearCache(): Promise<void>;
}
export declare class CodeContextManager implements ICodeContextManager {
    private static _instance;
    private _cache;
    private _metrics;
    private _config;
    private _contextStack;
    private constructor();
    static getInstance(config?: Config): CodeContextManager;
    getConfig(): Config;
    pushContext(context: Config): void;
    popContext(): void;
    getContext(target: string, type: string, depth: number): Promise<CodeContext>;
    clearCache(): Promise<void>;
    recordLatency(latency: number): void;
    withContext<T>(context: Config, operation: () => T): T;
}

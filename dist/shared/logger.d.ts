type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export declare class Logger {
    private static instance;
    static getInstance(): Logger;
    static resetInstance(): void;
    private level;
    setLevel(newLevel: LogLevel): void;
    private shouldLog;
    private formatArgs;
    error(...args: any[]): void;
    success(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    log(...args: any[]): void;
    trace(...args: any[]): void;
}
export declare const logger: Logger;
export {};

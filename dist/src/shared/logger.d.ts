declare class Logger {
    private isVerbose;
    setVerbose(value: boolean): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    success(...args: unknown[]): void;
    info(...args: unknown[]): void;
    note(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    trace(...args: unknown[]): void;
    log(...args: unknown[]): void;
    private formatArgs;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map
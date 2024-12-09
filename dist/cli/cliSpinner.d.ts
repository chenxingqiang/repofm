export declare class CLISpinner {
    private static spinner;
    static start(text?: string): any;
    static stop(): void;
    static succeed(text?: string): void;
    static fail(text?: string): void;
    static cleanup(): void;
}

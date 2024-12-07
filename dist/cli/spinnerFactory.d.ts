export interface Spinner {
    start(text?: string): void;
    stop(): void;
    succeed(text?: string): void;
    fail(text?: string): void;
}
export declare function createSpinner(): Spinner;

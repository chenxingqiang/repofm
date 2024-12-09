import { Spinner } from './types/spinner.js';
export declare class FallbackSpinner implements Spinner {
    private text;
    constructor(text?: string);
    start(text?: string): void;
    stop(): void;
    succeed(text?: string): void;
    fail(text?: string): void;
    warn(text?: string): void;
    info(text?: string): void;
}

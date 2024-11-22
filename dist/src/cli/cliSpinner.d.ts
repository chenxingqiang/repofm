declare class Spinner {
    private spinner;
    private message;
    private currentFrame;
    private interval;
    constructor(message: string);
    start(): void;
    update(message: string): void;
    stop(finalMessage: string): void;
    succeed(message: string): void;
    fail(message: string): void;
}
export default Spinner;
//# sourceMappingURL=cliSpinner.d.ts.map
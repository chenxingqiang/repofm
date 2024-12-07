export declare class CodeContextManager {
    private options;
    constructor(options: {
        outputFormat: string;
    });
    getContext(options: {
        target?: string;
        type?: string;
        depth?: string;
        format?: string;
    }): Promise<string>;
}

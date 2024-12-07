export interface OutputGeneratorOptions {
    format?: 'json' | 'text' | 'markdown';
    pretty?: boolean;
}
export declare class OutputGenerator {
    private options;
    constructor(options?: OutputGeneratorOptions);
    generate(data: any): string;
    private generateTextOutput;
    private generateMarkdownOutput;
}
export default OutputGenerator;

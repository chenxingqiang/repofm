export interface FormatOptions {
    format: 'plain' | 'json';
    targetDir: string;
}
export declare function formatFindResults(results: string[], options: FormatOptions): string;

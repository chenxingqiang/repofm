export interface IgnoreOptions {
    patterns: string[];
    useGitignore: boolean;
    useDefaultPatterns: boolean;
}
export interface SearchOptions {
    dot?: boolean;
    followSymlinks?: boolean;
    ignore?: string[] | IgnoreOptions;
}
export interface SearchResult {
    path: string;
    matches?: {
        line: number;
        content: string;
    }[];
}
export declare function searchFiles(searchPath: string, pattern: string, options?: SearchOptions): Promise<SearchResult[]>;
export declare function findFiles(searchPath: string, patterns: string[], options?: SearchOptions): Promise<string[]>;
export declare function matchPattern(filePath: string, pattern: string, caseSensitive?: boolean): boolean;

export interface IgnoreConfig {
    useGitignore?: boolean;
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
    patterns?: string[];
}
export interface SearchConfig {
    patterns: string[];
    ignore: IgnoreConfig;
    dot: boolean;
    followSymlinks: boolean;
}
export declare const searchFiles: (rootDir: string, config?: Partial<SearchConfig>) => Promise<string[]>;
export declare function sortFiles(files: string[]): string[];

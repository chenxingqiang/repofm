export interface IgnoreConfig {
    patterns: string[];
    useGitignore: boolean;
    useDefaultPatterns: boolean;
}
export interface SearchConfig {
    patterns: string[];
    ignore: IgnoreConfig;
    dot: boolean;
    followSymlinks: boolean;
}
export declare const searchFiles: (rootDir: string, config?: Partial<SearchConfig>) => Promise<string[]>;
//# sourceMappingURL=fileSearch.d.ts.map
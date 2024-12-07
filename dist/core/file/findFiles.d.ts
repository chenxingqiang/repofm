export interface FindConfig {
    pattern: string;
    type: 'file' | 'directory' | 'both';
    maxDepth: number;
    ignoreCase: boolean;
    excludePatterns: string[];
    followSymlinks: boolean;
}
export declare function findFiles(rootDir: string, config: FindConfig): Promise<string[]>;

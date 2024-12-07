export interface FindOptions {
    pattern?: string;
    type?: 'file' | 'directory' | 'both';
    maxDepth?: number;
    format?: 'plain' | 'json';
    ignoreCase?: boolean;
    excludePatterns?: string[];
}
export declare function runFindAction(targetDir: string, options?: FindOptions): Promise<void>;

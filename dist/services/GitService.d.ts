interface GitStatus {
    path: string;
    status: string;
}
export declare class GitService {
    private cwd;
    constructor(cwd: string);
    isGitRepository(): Promise<boolean>;
    getStatus(): Promise<GitStatus[]>;
    stageAll(): Promise<void>;
    /**
     * Advanced file staging with comprehensive pattern matching
     * @param includePatterns Glob patterns to include
     * @param excludePatterns Glob patterns to exclude
     * @param options Additional options for fine-tuned matching
     */
    stageFiles(includePatterns: string[], excludePatterns?: string[], options?: {
        ignoreCase?: boolean;
        dot?: boolean;
        debug?: boolean;
    }): Promise<void>;
    getStagedFiles(): Promise<string[]>;
    generateCommitMessage(files: string[]): Promise<string>;
    commit(message: string): Promise<void>;
    getCurrentBranch(): Promise<string>;
    push(remote: string, branch: string): Promise<void>;
    private execGit;
    private findCommonDirectory;
    private getChangeType;
}
export {};

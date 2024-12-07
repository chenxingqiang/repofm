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
    stageFiles(pattern: string): Promise<void>;
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

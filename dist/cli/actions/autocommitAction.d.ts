export interface AutocommitOptions {
    message?: string;
    patterns?: string[];
    excludePatterns?: string[];
    push?: boolean;
    branch?: string;
    remote?: string;
    all?: boolean;
    interactive?: boolean;
    ignoreCase?: boolean;
    includeDotFiles?: boolean;
    debug?: boolean;
    aiCommitMessage?: boolean;
    maxCommitLength?: number;
}
export declare function runAutocommitAction(targetDir: string, options?: AutocommitOptions): Promise<void>;

export interface AutoCommitOptions {
    interactive?: boolean;
    message?: string;
}
export declare function autoCommit(workingDir: string, options?: AutoCommitOptions): Promise<void>;
export default autoCommit;

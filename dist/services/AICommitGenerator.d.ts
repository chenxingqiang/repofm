export interface CommitGenerationOptions {
    provider?: string;
    maxLength?: number;
    temperature?: number;
}
export declare class AICommitGenerator {
    /**
     * Generate a comprehensive, context-aware commit message
     * @param options Options for commit message generation
     * @returns Generated commit message
     */
    static generateCommitMessage(options: {
        stagedFiles: string[];
        maxLength?: number;
        cwd?: string;
        provider?: string;
    }): Promise<string>;
    /**
     * Validate and clean generated commit message
     * @param message Generated commit message
     * @param maxLength Maximum allowed length
     * @returns Validated commit message
     */
    private static validateCommitMessage;
}

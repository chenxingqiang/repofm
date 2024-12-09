export interface CommitGeneratorSettings {
    aiModel: 'gpt-3.5-turbo' | 'gpt-4o' | 'custom';
    maxLength: number;
    temperature: number;
    fallbackStrategy: 'random' | 'contextual' | 'ml';
    projectSpecificRules?: {
        [projectName: string]: {
            commitPrefix?: string;
            mandatoryTags?: string[];
        };
    };
}
export declare class CommitGeneratorConfig {
    private static CONFIG_PATH;
    private static defaultSettings;
    /**
     * Load configuration from file or return defaults
     */
    static loadConfig(): CommitGeneratorSettings;
    /**
     * Create default configuration file
     */
    static createDefaultConfig(): void;
    /**
     * Update configuration dynamically
     */
    static updateConfig(newSettings: Partial<CommitGeneratorSettings>): CommitGeneratorSettings;
    /**
     * Get project-specific commit rules
     */
    static getProjectRules(projectName: string): {
        commitPrefix?: string;
        mandatoryTags?: string[];
    };
}
export declare const commitConfig: typeof CommitGeneratorConfig;

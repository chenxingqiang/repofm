interface MigrationResult {
    configMigrated: boolean;
    ignoreMigrated: boolean;
    instructionMigrated: boolean;
    outputFilesMigrated: string[];
    error?: Error;
}
export declare function runMigrationAction(configPath: string): Promise<MigrationResult>;
export declare function updateGitignore(rootDir: string): Promise<void>;
export {};

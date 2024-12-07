export declare class RepoMigrationService {
    private config;
    constructor(config: any);
    migrateRepository(options: {
        user?: string;
        name?: string;
        owner?: string;
        clone?: boolean;
    }): Promise<void>;
}

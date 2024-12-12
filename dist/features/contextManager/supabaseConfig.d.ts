export interface SupabaseConfig {
    url: string;
    key: string;
}
export declare class SupabaseConfigManager {
    private client;
    private config;
    initialize(config: SupabaseConfig): void;
    isInitialized(): boolean;
    getClient(): any;
    getConfig(): SupabaseConfig;
    testConnection(): Promise<boolean>;
}

import { SupabaseClient } from '@supabase/supabase-js.js';
export interface SupabaseConfig {
    url: string;
    anonKey: string;
    enableLogging?: boolean;
}
export declare class SupabaseConfigManager {
    private client;
    private config;
    initialize(config: SupabaseConfig): void;
    isInitialized(): boolean;
    getClient(): SupabaseClient;
    getConfig(): SupabaseConfig;
    testConnection(): Promise<boolean>;
}

import { createClient } from '@supabase/supabase-js';
export class SupabaseConfigManager {
    constructor() {
        this.client = null;
        this.config = null;
    }
    initialize(config) {
        this.config = config;
        this.client = createClient(config.url, config.anonKey, {
            auth: {
                persistSession: false
            }
        });
    }
    isInitialized() {
        return this.client !== null && this.config !== null;
    }
    getClient() {
        if (!this.client) {
            throw new Error('Supabase client not initialized');
        }
        return this.client;
    }
    getConfig() {
        if (!this.config) {
            throw new Error('Supabase configuration not initialized');
        }
        return this.config;
    }
    async testConnection() {
        if (!this.client) {
            return false;
        }
        try {
            const { data, error } = await this.client
                .from('health_check')
                .select('*')
                .single();
            return !error;
        }
        catch (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
    }
}
//# sourceMappingURL=supabaseConfig.js.map
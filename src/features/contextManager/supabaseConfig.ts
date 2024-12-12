import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
}

export class SupabaseConfigManager {
  private client: any | null = null;
  private config: SupabaseConfig | null = null;

  public initialize(config: SupabaseConfig): void {
    this.config = config;
    this.client = createClient(config.url, config.key, {
      auth: {
        persistSession: false
      }
    });
  }

  public isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  public getClient(): any {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }
    return this.client;
  }

  public getConfig(): SupabaseConfig {
    if (!this.config) {
      throw new Error('Supabase configuration not initialized');
    }
    return this.config;
  }

  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const { data, error } = await this.client
        .from('health_check')
        .select('*')
        .single();

      return !error;
    } catch (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
  }
}

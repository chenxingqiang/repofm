import type { Config } from '../types/config.js';
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    getConfig(): Config;
    updateConfig(newConfig: Partial<Config>): void;
}
export declare function loadConfig(): Config;

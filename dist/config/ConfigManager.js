import { defaultConfig } from './index.js';
export class ConfigManager {
    constructor() {
        this.config = { ...defaultConfig };
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig,
        };
    }
}
export function loadConfig() {
    return ConfigManager.getInstance().getConfig();
}

import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../shared/logger.js';
export class CommitGeneratorConfig {
    /**
     * Load configuration from file or return defaults
     */
    static loadConfig() {
        try {
            if (!fs.existsSync(this.CONFIG_PATH)) {
                this.createDefaultConfig();
            }
            const configContent = fs.readFileSync(this.CONFIG_PATH, 'utf-8');
            return {
                ...this.defaultSettings,
                ...JSON.parse(configContent)
            };
        }
        catch (error) {
            logger.warn('Failed to load commit generator config', error);
            return this.defaultSettings;
        }
    }
    /**
     * Create default configuration file
     */
    static createDefaultConfig() {
        try {
            fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(this.defaultSettings, null, 2));
            logger.info('Created default commit generator configuration');
        }
        catch (error) {
            logger.error('Failed to create default config', error);
        }
    }
    /**
     * Update configuration dynamically
     */
    static updateConfig(newSettings) {
        const currentConfig = this.loadConfig();
        const updatedConfig = { ...currentConfig, ...newSettings };
        try {
            fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));
            return updatedConfig;
        }
        catch (error) {
            logger.error('Failed to update config', error);
            return currentConfig;
        }
    }
    /**
     * Get project-specific commit rules
     */
    static getProjectRules(projectName) {
        const config = this.loadConfig();
        return config.projectSpecificRules?.[projectName] || {};
    }
}
CommitGeneratorConfig.CONFIG_PATH = path.join(process.cwd(), '.repofm-commit-config.json');
CommitGeneratorConfig.defaultSettings = {
    aiModel: 'gpt-3.5-turbo',
    maxLength: 72,
    temperature: 0.7,
    fallbackStrategy: 'contextual'
};
// Singleton export for easy configuration access
export const commitConfig = CommitGeneratorConfig;

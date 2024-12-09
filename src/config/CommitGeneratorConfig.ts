import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../shared/logger.js';

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

export class CommitGeneratorConfig {
  private static CONFIG_PATH = path.join(
    process.cwd(), 
    '.repofm-commit-config.json'
  );

  private static defaultSettings: CommitGeneratorSettings = {
    aiModel: 'gpt-3.5-turbo',
    maxLength: 72,
    temperature: 0.7,
    fallbackStrategy: 'contextual'
  };

  /**
   * Load configuration from file or return defaults
   */
  static loadConfig(): CommitGeneratorSettings {
    try {
      if (!fs.existsSync(this.CONFIG_PATH)) {
        this.createDefaultConfig();
      }

      const configContent = fs.readFileSync(
        this.CONFIG_PATH, 
        'utf-8'
      );
      
      return {
        ...this.defaultSettings,
        ...JSON.parse(configContent)
      };
    } catch (error) {
      logger.warn('Failed to load commit generator config', error);
      return this.defaultSettings;
    }
  }

  /**
   * Create default configuration file
   */
  static createDefaultConfig(): void {
    try {
      fs.writeFileSync(
        this.CONFIG_PATH,
        JSON.stringify(this.defaultSettings, null, 2)
      );
      logger.info('Created default commit generator configuration');
    } catch (error) {
      logger.error('Failed to create default config', error);
    }
  }

  /**
   * Update configuration dynamically
   */
  static updateConfig(
    newSettings: Partial<CommitGeneratorSettings>
  ): CommitGeneratorSettings {
    const currentConfig = this.loadConfig();
    const updatedConfig = { ...currentConfig, ...newSettings };

    try {
      fs.writeFileSync(
        this.CONFIG_PATH,
        JSON.stringify(updatedConfig, null, 2)
      );
      return updatedConfig;
    } catch (error) {
      logger.error('Failed to update config', error);
      return currentConfig;
    }
  }

  /**
   * Get project-specific commit rules
   */
  static getProjectRules(projectName: string) {
    const config = this.loadConfig();
    return config.projectSpecificRules?.[projectName] || {};
  }
}

// Singleton export for easy configuration access
export const commitConfig = CommitGeneratorConfig;

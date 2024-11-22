import type { Config } from '../types/config.js';
import { defaultConfig } from './index.js';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = { ...defaultConfig };
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }

  public updateConfig(newConfig: Partial<Config>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }
}

export function loadConfig(): Config {
  return ConfigManager.getInstance().getConfig();
}

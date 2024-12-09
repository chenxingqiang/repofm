import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../shared/logger.js';

export interface AIProviderCredentials {
  openai?: string;
  anthropic?: string;
  google?: string;
  mistral?: string;
  groq?: string;
  bedrock?: string;
  ollama?: string;
}

export interface AIProviderConfig {
  defaultProvider: string;
  providers: AIProviderCredentials;
}

export class AIProviderConfigManager {
  private static CONFIG_PATH = path.join(
    process.env.HOME || process.cwd(), 
    '.repofm', 
    'ai-providers.json'
  );

  /**
   * Ensure configuration directory exists
   */
  private static ensureConfigDirectory(): void {
    const configDir = path.dirname(this.CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  /**
   * Load AI provider configuration
   */
  static loadConfig(): AIProviderConfig {
    this.ensureConfigDirectory();

    const defaultConfig: AIProviderConfig = {
      defaultProvider: 'ollama',
      providers: {}
    };

    try {
      if (!fs.existsSync(this.CONFIG_PATH)) {
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }

      const configContent = fs.readFileSync(
        this.CONFIG_PATH, 
        'utf-8'
      );
      
      return {
        ...defaultConfig,
        ...JSON.parse(configContent)
      };
    } catch (error) {
      logger.warn('Failed to load AI provider config', error);
      return defaultConfig;
    }
  }

  /**
   * Save AI provider configuration
   */
  static saveConfig(config: AIProviderConfig): void {
    this.ensureConfigDirectory();

    try {
      fs.writeFileSync(
        this.CONFIG_PATH,
        JSON.stringify(config, null, 2)
      );
      logger.info('AI provider configuration updated');
    } catch (error) {
      logger.error('Failed to save AI provider config', error);
    }
  }

  /**
   * Set credentials for a specific provider
   */
  static setProviderCredentials(
    provider: keyof AIProviderCredentials, 
    apiKey: string
  ): void {
    const config = this.loadConfig();
    config.providers[provider] = apiKey;
    this.saveConfig(config);
  }

  /**
   * Get API key for a specific provider
   */
  static getProviderApiKey(
    provider: keyof AIProviderCredentials
  ): string | undefined {
    const config = this.loadConfig();
    return config.providers[provider] || 
      process.env[`${provider.toUpperCase()}_API_KEY`];
  }

  /**
   * Set default provider
   */
  static setDefaultProvider(provider: string): void {
    const config = this.loadConfig();
    config.defaultProvider = provider;
    this.saveConfig(config);
  }

  /**
   * Validate provider credentials
   */
  static async validateCredentials(
    provider: keyof AIProviderCredentials, 
    apiKey: string
  ): Promise<boolean> {
    // Implement provider-specific validation logic
    switch (provider) {
      case 'openai':
        return this.validateOpenAIKey(apiKey);
      case 'anthropic':
        return this.validateAnthropicKey(apiKey);
      case 'ollama':
        return this.validateOllamaKey(apiKey);
      // Add more provider-specific validations
      default:
        return true;
    }
  }

  /**
   * Validate OpenAI API Key
   */
  private static async validateOpenAIKey(apiKey: string): Promise<boolean> {
    try {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      
      // Attempt a simple API call
      await openai.models.list();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Anthropic API Key
   */
  private static async validateAnthropicKey(apiKey: string): Promise<boolean> {
    try {
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey });
      
      // Attempt a simple API call
      await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test connection' }]
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Ollama API Key
   */
  private static async validateOllamaKey(apiKey: string): Promise<boolean> {
    try {
      const { OllamaInteractionService } = await import('../services/OllamaInteractionService.js');
      const ollamaService = new OllamaInteractionService();
      
      // Attempt a simple API call
      return await ollamaService.isOllamaRunning();
    } catch {
      return false;
    }
  }

  /**
   * Get available models for a specific provider
   */
  static async getAvailableModels(
    provider: keyof AIProviderCredentials
  ): Promise<string[]> {
    // Implement provider-specific model listing logic
    switch (provider) {
      case 'ollama':
        return this.getOllamaModels();
      // Add model listing for other providers here
      default:
        return [];
    }
  }

  /**
   * Get available Ollama models
   */
  private static async getOllamaModels(): Promise<string[]> {
    try {
      const { OllamaInteractionService } = await import('../services/OllamaInteractionService.js');
      const ollamaService = new OllamaInteractionService();
      
      // Attempt a simple API call
      return await ollamaService.listLocalModels();
    } catch {
      return [];
    }
  }
}

// Singleton export for easy access
export const aiProviderConfig = AIProviderConfigManager;

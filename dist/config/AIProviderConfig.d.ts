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
export declare class AIProviderConfigManager {
    private static CONFIG_PATH;
    /**
     * Ensure configuration directory exists
     */
    private static ensureConfigDirectory;
    /**
     * Load AI provider configuration
     */
    static loadConfig(): AIProviderConfig;
    /**
     * Save AI provider configuration
     */
    static saveConfig(config: AIProviderConfig): void;
    /**
     * Set credentials for a specific provider
     */
    static setProviderCredentials(provider: keyof AIProviderCredentials, apiKey: string): void;
    /**
     * Get API key for a specific provider
     */
    static getProviderApiKey(provider: keyof AIProviderCredentials): string | undefined;
    /**
     * Set default provider
     */
    static setDefaultProvider(provider: string): void;
    /**
     * Validate provider credentials
     */
    static validateCredentials(provider: keyof AIProviderCredentials, apiKey: string): Promise<boolean>;
    /**
     * Validate OpenAI API Key
     */
    private static validateOpenAIKey;
    /**
     * Validate Anthropic API Key
     */
    private static validateAnthropicKey;
    /**
     * Validate Ollama API Key
     */
    private static validateOllamaKey;
    /**
     * Get available models for a specific provider
     */
    static getAvailableModels(provider: keyof AIProviderCredentials): Promise<string[]>;
    /**
     * Get available Ollama models
     */
    private static getOllamaModels;
}
export declare const aiProviderConfig: typeof AIProviderConfigManager;

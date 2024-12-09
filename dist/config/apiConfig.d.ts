export declare class APIConfig {
    /**
     * Get OpenAI API Key from environment
     * @returns OpenAI API Key or throws an error
     */
    static getOpenAIApiKey(): string;
    /**
     * Validate and set OpenAI API Key
     * @param apiKey OpenAI API Key
     */
    static setOpenAIApiKey(apiKey: string): void;
}

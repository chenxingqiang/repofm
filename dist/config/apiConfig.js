import { logger } from '../shared/logger.js';
export class APIConfig {
    /**
     * Get OpenAI API Key from environment
     * @returns OpenAI API Key or throws an error
     */
    static getOpenAIApiKey() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            logger.error('OpenAI API Key is not set. Please set OPENAI_API_KEY environment variable.');
            throw new Error('Missing OpenAI API Key');
        }
        return apiKey;
    }
    /**
     * Validate and set OpenAI API Key
     * @param apiKey OpenAI API Key
     */
    static setOpenAIApiKey(apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('Invalid API Key');
        }
        process.env.OPENAI_API_KEY = apiKey;
        logger.info('OpenAI API Key successfully configured');
    }
}
//# sourceMappingURL=apiConfig.js.map
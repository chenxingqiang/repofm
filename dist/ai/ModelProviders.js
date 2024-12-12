import { OpenAI } from 'openai';
import { logger } from '../shared/logger.js';
import { OllamaInteractionService } from '../services/OllamaInteractionService.js';
export class OpenAIProvider {
    constructor(apiKey) {
        this.name = 'OpenAI';
        this.client = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY
        });
    }
    async generateText(prompt, options) {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options?.maxLength,
                temperature: options?.temperature
            });
            return response.choices[0]?.message?.content || '';
        }
        catch (error) {
            logger.error('OpenAI text generation failed', error);
            throw error;
        }
    }
    async generateObject(prompt, schema, options) {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options?.maxLength,
                temperature: options?.temperature
            });
            const data = JSON.parse(response.choices[0]?.message?.content || '{}');
            return schema.parse(data);
        }
        catch (error) {
            logger.error('OpenAI object generation failed', error);
            throw error;
        }
    }
    async streamText(prompt, options) {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options?.maxLength,
                temperature: options?.temperature,
                stream: true
            });
            const textStream = (async function* () {
                for await (const chunk of response) {
                    yield chunk.choices[0]?.delta?.content || '';
                }
            })();
            return { textStream };
        }
        catch (error) {
            logger.error('OpenAI text streaming failed', error);
            throw error;
        }
    }
}
export class OllamaProvider {
    isAvailable() {
        throw new Error('Method not implemented.');
    }
    setModel(selectedModel) {
        throw new Error('Method not implemented.');
    }
    getConfig() {
        return this.ollamaService.getConfigOptions();
    }
    generateCommitMessage(fileChanges) {
        throw new Error('Method not implemented.');
    }
    chat(chatMessages) {
        throw new Error('Method not implemented.');
    }
    async getAvailableModels() {
        try {
            const models = await this.ollamaService.listLocalModels();
            return models.map(model => model.name);
        }
        catch (error) {
            logger.error('Failed to get available models', error);
            return [];
        }
    }
    constructor(config = {}) {
        this.name = 'Ollama';
        this.ollamaService = new OllamaInteractionService(config);
    }
    async generateText(prompt, options) {
        try {
            const response = await this.ollamaService.generateText(prompt, {
                maxTokens: options?.maxLength,
                temperature: options?.temperature
            });
            return response.trim();
        }
        catch (error) {
            logger.error('Ollama text generation failed', error);
            throw error;
        }
    }
    async generateObject(prompt, schema, options) {
        try {
            const response = await this.ollamaService.generateText(prompt, {
                maxTokens: options?.maxLength,
                temperature: options?.temperature
            });
            const data = JSON.parse(response);
            return schema.parse(data);
        }
        catch (error) {
            logger.error('Ollama object generation failed', error);
            throw error;
        }
    }
    async streamText(prompt, options) {
        try {
            const response = await this.ollamaService.streamText(prompt, {
                maxTokens: options?.maxLength,
                temperature: options?.temperature
            });
            return { textStream: response.stream };
        }
        catch (error) {
            logger.error('Ollama text streaming failed', error);
            throw error;
        }
    }
}
export class ModelProviderFactory {
    constructor() {
        this.providers = new Map();
        // Initialize with available providers
        this.registerProvider(new OpenAIProvider());
        this.registerProvider(new OllamaProvider());
    }
    static getInstance() {
        if (!ModelProviderFactory.instance) {
            ModelProviderFactory.instance = new ModelProviderFactory();
        }
        return ModelProviderFactory.instance;
    }
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    getAllProviders() {
        return Array.from(this.providers.values());
    }
    async createProvider(providerName, apiKey) {
        const provider = this.getProvider(providerName);
        if (provider) {
            return provider;
        }
        switch (providerName.toLowerCase()) {
            case 'openai':
                return new OpenAIProvider(apiKey);
            case 'ollama':
                return new OllamaProvider();
            default:
                throw new Error(`Unsupported AI provider: ${providerName}`);
        }
    }
}
//# sourceMappingURL=ModelProviders.js.map
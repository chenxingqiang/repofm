import { OpenAI } from 'openai';
import { OpenAIClient as createGroq } from '@ai-sdk/openai';
import { BedrockClient as bedrock } from '@ai-sdk/amazon-bedrock';
import { AnthropicClient as anthropic } from '@ai-sdk/anthropic';
import { GoogleClient as google } from '@ai-sdk/google';
import { MistralClient as mistral } from '@ai-sdk/mistral';
import { generateText, generateObject, streamText } from 'ai';
import { z } from 'zod';
import { logger } from '../shared/logger.js';
import { OllamaInteractionService } from '../services/OllamaInteractionService.js';
export class OpenAIProvider {
    constructor(apiKey) {
        this.name = 'OpenAI';
        this.description = 'OpenAI provider';
        this.models = ['text-davinci-003', 'text-davinci-002', 'text-babbage-001', 'text-ada-001'];
        this.defaultModel = 'text-davinci-003';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation'];
        this.client = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY
        });
    }
    async initialize(config) {
        // No initialization needed for OpenAI
    }
    async chat(messages) {
        // Not implemented for OpenAI
        throw new Error('Chat functionality not implemented for OpenAI');
    }
    async getAvailableModels() {
        return this.models;
    }
    getCurrentModel() {
        return this.defaultModel;
    }
    async setModel(model) {
        // Not implemented for OpenAI
        throw new Error('Model selection not implemented for OpenAI');
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            const changesSummary = fileChanges.join('\n');
            const response = await generateText({
                model: this.client.chat.completions.create,
                prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            return response.text.trim();
        }
        catch (error) {
            logger.error('OpenAI commit message generation failed', error);
            throw error;
        }
    }
}
export class GroqLlamaProvider {
    constructor(apiKey) {
        this.name = 'Groq Llama';
        this.description = 'Groq Llama provider';
        this.models = ['llama-3.1-70b-versatile'];
        this.defaultModel = 'llama-3.1-70b-versatile';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation'];
        this.client = createGroq({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: apiKey || process.env.GROQ_API_KEY
        });
    }
    async initialize(config) {
        // No initialization needed for Groq Llama
    }
    async chat(messages) {
        // Not implemented for Groq Llama
        throw new Error('Chat functionality not implemented for Groq Llama');
    }
    async getAvailableModels() {
        return this.models;
    }
    getCurrentModel() {
        return this.defaultModel;
    }
    async setModel(model) {
        // Not implemented for Groq Llama
        throw new Error('Model selection not implemented for Groq Llama');
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            const changesSummary = fileChanges.join('\n');
            const response = await generateText({
                model: this.client('llama-3.1-70b-versatile'),
                prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            return response.text.trim();
        }
        catch (error) {
            logger.error('Groq Llama commit message generation failed', error);
            throw error;
        }
    }
}
export class BedrockLlamaProvider {
    constructor() {
        this.name = 'Amazon Bedrock Llama';
        this.description = 'Amazon Bedrock Llama provider';
        this.models = ['meta.llama3-1-405b-instruct-v1'];
        this.defaultModel = 'meta.llama3-1-405b-instruct-v1';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation'];
    }
    async initialize(config) {
        // No initialization needed for Bedrock Llama
    }
    async chat(messages) {
        // Not implemented for Bedrock Llama
        throw new Error('Chat functionality not implemented for Bedrock Llama');
    }
    async getAvailableModels() {
        return this.models;
    }
    getCurrentModel() {
        return this.defaultModel;
    }
    async setModel(model) {
        // Not implemented for Bedrock Llama
        throw new Error('Model selection not implemented for Bedrock Llama');
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            const changesSummary = fileChanges.join('\n');
            const response = await generateText({
                model: bedrock('meta.llama3-1-405b-instruct-v1'),
                prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            return response.text.trim();
        }
        catch (error) {
            logger.error('Bedrock Llama commit message generation failed', error);
            throw error;
        }
    }
}
export class AnthropicProvider {
    constructor() {
        this.name = 'Anthropic';
        this.description = 'Anthropic provider';
        this.models = ['claude-3-opus-20240229'];
        this.defaultModel = 'claude-3-opus-20240229';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation'];
    }
    async initialize(config) {
        // No initialization needed for Anthropic
    }
    async chat(messages) {
        // Not implemented for Anthropic
        throw new Error('Chat functionality not implemented for Anthropic');
    }
    async getAvailableModels() {
        return this.models;
    }
    getCurrentModel() {
        return this.defaultModel;
    }
    async setModel(model) {
        // Not implemented for Anthropic
        throw new Error('Model selection not implemented for Anthropic');
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            const changesSummary = fileChanges.join('\n');
            const response = await generateText({
                model: anthropic('claude-3-opus-20240229'),
                prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            return response.text.trim();
        }
        catch (error) {
            logger.error('Anthropic commit message generation failed', error);
            throw error;
        }
    }
}
export class GoogleProvider {
    constructor() {
        this.name = 'Google';
        this.description = 'Google provider';
        this.models = ['gemini-pro'];
        this.defaultModel = 'gemini-pro';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation'];
    }
    async initialize(config) {
        // No initialization needed for Google
    }
    async chat(messages) {
        // Not implemented for Google
        throw new Error('Chat functionality not implemented for Google');
    }
    async getAvailableModels() {
        return this.models;
    }
    getCurrentModel() {
        return this.defaultModel;
    }
    async setModel(model) {
        // Not implemented for Google
        throw new Error('Model selection not implemented for Google');
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            const changesSummary = fileChanges.join('\n');
            const response = await generateText({
                model: google('gemini-pro'),
                prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            return response.text.trim();
        }
        catch (error) {
            logger.error('Google commit message generation failed', error);
            throw error;
        }
    }
}
export class MistralProvider {
    constructor() {
        this.name = 'Mistral';
        this.description = 'Mistral provider';
        this.models = ['mistral-large-latest'];
        this.defaultModel = 'mistral-large-latest';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation'];
    }
    async initialize(config) {
        // No initialization needed for Mistral
    }
    async chat(messages) {
        // Not implemented for Mistral
        throw new Error('Chat functionality not implemented for Mistral');
    }
    async getAvailableModels() {
        return this.models;
    }
    getCurrentModel() {
        return this.defaultModel;
    }
    async setModel(model) {
        // Not implemented for Mistral
        throw new Error('Model selection not implemented for Mistral');
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            const changesSummary = fileChanges.join('\n');
            const response = await generateText({
                model: mistral('mistral-large-latest'),
                prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            return response.text.trim();
        }
        catch (error) {
            logger.error('Mistral commit message generation failed', error);
            throw error;
        }
    }
}
export class OllamaProvider {
    constructor(config = {}) {
        this.name = 'Ollama';
        this.description = 'Ollama provider';
        this.models = [];
        this.defaultModel = '';
        this.maxTokens = 2048;
        this.supportedFeatures = ['commit-message-generation', 'chat'];
        this.ollamaService = new OllamaInteractionService(config);
    }
    async initialize(config) {
        await this.ollamaService.initialize(config);
    }
    async chat(messages) {
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        return this.ollamaService.chat(formattedMessages);
    }
    async getAvailableModels() {
        return this.ollamaService.getAvailableModels();
    }
    getCurrentModel() {
        return this.ollamaService.currentModel;
    }
    async setModel(model) {
        await this.ollamaService.setModel(model);
    }
    async generateCommitMessage(fileChanges, options = { maxLength: 72, temperature: 0.7 }) {
        try {
            // Ensure Ollama is running
            const isRunning = await this.ollamaService.isOllamaRunning();
            if (!isRunning) {
                throw new Error('Ollama is not running. Please start Ollama service.');
            }
            // If no model is set, try to use the first available model
            if (!this.ollamaService.currentModel) {
                const models = await this.ollamaService.listLocalModels();
                if (models.length === 0) {
                    throw new Error('No Ollama models available. Please pull a model first.');
                }
                await this.setModel(models[0].name);
            }
            const changesSummary = fileChanges.join('\n');
            const prompt = `Generate a concise git commit message for these changes:\n${changesSummary}

Guidelines:
- Keep the message under ${options.maxLength} characters
- Use imperative mood (e.g., "Add feature" not "Added feature")
- Be specific and descriptive
- Focus on the purpose of the changes, not the details`;
            const response = await this.ollamaService.generateText(prompt, {
                maxTokens: options.maxLength,
                temperature: options.temperature
            });
            // Trim and truncate to ensure it meets length requirements
            const commitMessage = response.trim().slice(0, options.maxLength);
            return commitMessage;
        }
        catch (error) {
            logger.error('Ollama commit message generation failed', error);
            throw error;
        }
    }
}
export class ModelProviderFactory {
    static async createProvider(providerName, apiKey) {
        const ProviderClass = this.providers[providerName.toLowerCase()];
        if (!ProviderClass) {
            throw new Error(`Unsupported AI provider: ${providerName}`);
        }
        if (providerName.toLowerCase() === 'ollama') {
            const ollamaProvider = new OllamaProvider();
            if (await ollamaProvider.ollamaService.isOllamaRunning()) {
                return ollamaProvider;
            }
            throw new Error('Ollama is not running. Please start Ollama first.');
        }
        return new ProviderClass();
    }
    static registerProvider(name, providerClass) {
        this.providers[name.toLowerCase()] = providerClass;
    }
}
ModelProviderFactory.providers = {
    openai: OpenAIProvider,
    groq: GroqLlamaProvider,
    bedrock: BedrockLlamaProvider,
    anthropic: AnthropicProvider,
    google: GoogleProvider,
    mistral: MistralProvider,
    ollama: OllamaProvider
};
// Advanced Structured Commit Message Generation
export async function generateStructuredCommitMessage(fileChanges, options) {
    const { provider = 'groq', maxLength = 72, temperature = 0.7, returnType = 'text' } = options || {};
    try {
        const aiProvider = await ModelProviderFactory.createProvider(provider);
        // Structured object generation for more detailed commit insights
        if (returnType === 'object') {
            const { object } = await generateObject({
                model: aiProvider instanceof GroqLlamaProvider
                    ? groq('llama-3.1-70b-versatile')
                    : openai('gpt-4-turbo'),
                schema: z.object({
                    commitMessage: z.string().describe('Concise commit message'),
                    changeTypes: z.object({
                        added: z.number().describe('Number of added files'),
                        modified: z.number().describe('Number of modified files'),
                        deleted: z.number().describe('Number of deleted files')
                    }),
                    fileTypes: z.array(z.string()).describe('Unique file types changed')
                }),
                prompt: `Analyze these file changes and generate a structured commit message summary:
        ${fileChanges.join('\n')}`,
                temperature
            });
            return {
                message: object.commitMessage,
                metadata: {
                    provider: aiProvider.name,
                    length: object.commitMessage.length,
                    fileTypes: object.fileTypes,
                    structuredData: object
                }
            };
        }
        // Standard text generation
        const commitMessage = await aiProvider.generateCommitMessage(fileChanges, { maxLength, temperature });
        return {
            message: commitMessage,
            metadata: {
                provider: aiProvider.name,
                length: commitMessage.length,
                fileTypes: [...new Set(fileChanges.map(change => change.split('.').pop() || 'unknown'))]
            }
        };
    }
    catch (error) {
        logger.error('Structured commit message generation failed', error);
        // Fallback mechanism
        const fallbackMessage = `Update ${fileChanges.length} file(s)`;
        return {
            message: fallbackMessage,
            metadata: {
                provider: 'fallback',
                length: fallbackMessage.length,
                fileTypes: [...new Set(fileChanges.map(change => change.split('.').pop() || 'unknown'))]
            }
        };
    }
}
// Streaming Commit Message Generation
export async function streamCommitMessage(fileChanges, options) {
    const { provider = 'groq', maxLength = 72, temperature = 0.7 } = options || {};
    try {
        const aiProvider = await ModelProviderFactory.createProvider(provider);
        const { textStream } = await streamText({
            model: aiProvider instanceof GroqLlamaProvider
                ? groq('llama-3.1-70b-versatile')
                : openai('gpt-4-turbo'),
            prompt: `Generate a concise git commit message for these changes:
      ${fileChanges.join('\n')}`,
            maxTokens: maxLength,
            temperature
        });
        return textStream;
    }
    catch (error) {
        logger.error('Streaming commit message generation failed', error);
        // Fallback generator
        async function* fallbackGenerator() {
            yield `Update ${fileChanges.length} file(s)`;
        }
        return fallbackGenerator();
    }
}
// Export for easy import
export const commitMessageGenerators = {
    generateStructuredCommitMessage,
    streamCommitMessage
};

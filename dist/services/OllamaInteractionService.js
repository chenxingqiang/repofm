import Ollama from 'ollama';
import { z } from 'zod';
// Validation schema for Ollama interaction configuration
const OllamaConfigSchema = z.object({
    model: z.string().default('llama2'),
    temperature: z.number().min(0).max(2).default(0.7),
    systemPrompt: z.string().optional(),
    maxTokens: z.number().positive().default(500),
    topK: z.number().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    repeatPenalty: z.number().min(0).optional()
});
export class OllamaInteractionService {
    constructor(config = {}) {
        this.availableModels = [];
        this.currentModel = null;
        this.config = OllamaConfigSchema.parse(config);
        this.initializeModels();
    }
    async initializeModels() {
        try {
            const response = await Ollama.list();
            this.availableModels = response.models.map(model => ({
                name: model.name,
                size: model.size,
                digest: model.digest,
                modifiedAt: new Date(model.modified_at),
                details: model.details
            }));
        }
        catch (error) {
            console.error('Failed to initialize models:', error);
            this.availableModels = [];
        }
    }
    async isOllamaRunning() {
        try {
            await Ollama.list();
            return true;
        }
        catch (error) {
            console.error('Error checking if Ollama is running:', error);
            return false;
        }
    }
    async listLocalModels() {
        if (this.availableModels.length === 0) {
            await this.initializeModels();
        }
        return this.availableModels;
    }
    async setModel(modelName) {
        try {
            const models = await this.listLocalModels();
            const modelExists = models.some(model => model.name === modelName);
            if (!modelExists) {
                console.warn(`Model ${modelName} not found. Attempting to pull...`);
                await this.pullModel(modelName);
            }
            this.currentModel = modelName;
            return true;
        }
        catch (error) {
            console.error(`Error setting model ${modelName}:`, error);
            return false;
        }
    }
    async pullModel(modelName) {
        try {
            await Ollama.pull({ model: modelName });
            console.log(`Successfully pulled model: ${modelName}`);
            return true;
        }
        catch (error) {
            console.error(`Error pulling model ${modelName}:`, error);
            return false;
        }
    }
    async generateText(prompt, options = {}) {
        if (!this.currentModel) {
            const models = await this.listLocalModels();
            if (models.length === 0) {
                throw new Error('No Ollama models available');
            }
            this.currentModel = models[0].name;
        }
        try {
            const response = await Ollama.chat({
                model: this.currentModel,
                messages: [{ role: 'user', content: prompt }],
                options: {
                    num_predict: options.maxTokens,
                    temperature: options.temperature
                }
            });
            return response.message.content;
        }
        catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    }
    async streamText(prompt, options = {}) {
        if (!this.currentModel) {
            const models = await this.listLocalModels();
            if (models.length === 0) {
                throw new Error('No Ollama models available');
            }
            this.currentModel = models[0].name;
        }
        try {
            const response = await Ollama.chat({
                model: this.currentModel,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
                options: {
                    num_predict: options.maxTokens,
                    temperature: options.temperature
                }
            });
            const stream = (async function* () {
                for await (const part of response) {
                    if (part.message?.content) {
                        yield part.message.content;
                    }
                }
            })();
            return { stream };
        }
        catch (error) {
            console.error('Error streaming text:', error);
            throw error;
        }
    }
    async interactiveChat() {
        console.log('Interactive chat with Ollama is not yet implemented.');
        // Future implementation could involve a CLI-based chat interface
    }
    // Validate and configure Ollama provider settings
    async validateConfig(config) {
        try {
            // Implement configuration validation logic
            config.parse({
                host: 'http://localhost:11434', // Default Ollama host
                models: await this.listLocalModels()
            });
            return true;
        }
        catch (error) {
            console.error('Ollama configuration validation failed:', error);
            return false;
        }
    }
    // Get available configuration options for Ollama
    getConfigOptions() {
        return {
            host: 'http://localhost:11434',
            availableModels: this.listLocalModels(),
            supportedFeatures: [
                'text_generation',
                'chat_completion',
                'model_pulling'
            ]
        };
    }
}
// Create a default service instance for easy import
export const ollamaService = new OllamaInteractionService();
//# sourceMappingURL=OllamaInteractionService.js.map
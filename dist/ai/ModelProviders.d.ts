import { z } from 'zod';
export interface AIModelProvider {
    name: string;
    generateText(prompt: string, options?: any): Promise<string>;
    generateObject<T>(prompt: string, schema: z.ZodSchema<T>, options?: any): Promise<T>;
    streamText(prompt: string, options?: any): Promise<{
        textStream: AsyncIterable<string>;
    }>;
}
export declare class OpenAIProvider implements AIModelProvider {
    private client;
    name: string;
    constructor(apiKey?: string);
    generateText(prompt: string, options?: any): Promise<string>;
    generateObject<T>(prompt: string, schema: z.ZodSchema<T>, options?: any): Promise<T>;
    streamText(prompt: string, options?: any): Promise<{
        textStream: AsyncIterable<string>;
    }>;
}
export interface OllamaConfig {
    model?: string;
    baseUrl?: string;
}
export declare class OllamaProvider implements AIModelProvider {
    isAvailable(): void;
    setModel(selectedModel: any): void;
    getConfig(): Record<string, any>;
    generateCommitMessage(fileChanges: string[]): void;
    chat(chatMessages: import("../services/OllamaInteractionService.js").ChatMessage[]): void;
    getAvailableModels(): Promise<string[]>;
    private ollamaService;
    name: string;
    constructor(config?: Partial<OllamaConfig>);
    generateText(prompt: string, options?: any): Promise<string>;
    generateObject<T>(prompt: string, schema: z.ZodSchema<T>, options?: any): Promise<T>;
    streamText(prompt: string, options?: any): Promise<{
        textStream: AsyncIterable<string>;
    }>;
}
export declare class ModelProviderFactory {
    private static instance;
    private providers;
    private constructor();
    static getInstance(): ModelProviderFactory;
    registerProvider(provider: AIModelProvider): void;
    getProvider(name: string): AIModelProvider | undefined;
    getAllProviders(): AIModelProvider[];
    createProvider(providerName: string, apiKey?: string): Promise<AIModelProvider>;
}

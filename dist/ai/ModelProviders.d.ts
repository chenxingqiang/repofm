import { OllamaConfig, ChatMessage } from '../services/OllamaInteractionService.js';
export interface AIModelProvider {
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength?: number;
        temperature?: number;
    }): Promise<string>;
}
export declare class OpenAIProvider implements AIModelProvider {
    private client;
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    constructor(apiKey?: string);
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class GroqLlamaProvider implements AIModelProvider {
    private client;
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    constructor(apiKey?: string);
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class BedrockLlamaProvider implements AIModelProvider {
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class AnthropicProvider implements AIModelProvider {
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class GoogleProvider implements AIModelProvider {
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class MistralProvider implements AIModelProvider {
    name: string;
    description: string;
    models: string[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class OllamaProvider implements AIModelProvider {
    private ollamaService;
    name: string;
    description: string;
    models: never[];
    defaultModel: string;
    maxTokens: number;
    supportedFeatures: string[];
    constructor(config?: Partial<OllamaConfig>);
    initialize(config: any): Promise<void>;
    chat(messages: ChatMessage[]): Promise<string>;
    getAvailableModels(): Promise<string[]>;
    getCurrentModel(): string;
    setModel(model: string): Promise<void>;
    generateCommitMessage(fileChanges: string[], options?: {
        maxLength: number;
        temperature: number;
    }): Promise<string>;
}
export declare class ModelProviderFactory {
    private static providers;
    static createProvider(providerName: string, apiKey?: string): Promise<AIModelProvider>;
    static registerProvider(name: string, providerClass: new () => AIModelProvider): void;
}
export declare function generateStructuredCommitMessage(fileChanges: string[], options?: {
    provider?: string;
    maxLength?: number;
    temperature?: number;
    returnType?: 'text' | 'object';
}): Promise<{
    message: string;
    metadata: {
        provider: string;
        length: number;
        fileTypes: string[];
        structuredData?: any;
    };
}>;
export declare function streamCommitMessage(fileChanges: string[], options?: {
    provider?: string;
    maxLength?: number;
    temperature?: number;
}): Promise<AsyncGenerator<string, void, unknown>>;
export declare const commitMessageGenerators: {
    generateStructuredCommitMessage: typeof generateStructuredCommitMessage;
    streamCommitMessage: typeof streamCommitMessage;
};

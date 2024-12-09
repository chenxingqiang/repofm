import { OpenAI } from 'openai';
import { createOpenAI } from '@ai-sdk/openai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { Message, CoreSystemMessage } from 'ai';
import { z } from 'zod';
import { logger } from '../shared/logger.js';
import { OllamaInteractionService, OllamaConfig, ChatMessage } from '../services/OllamaInteractionService.js';
import { Groq } from '@groq/groq';

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
  generateCommitMessage(
    fileChanges: string[], 
    options?: {
      maxLength?: number;
      temperature?: number;
    }
  ): Promise<string>;
}

export class OpenAIProvider implements AIModelProvider {
  private client: OpenAI;
  name = 'OpenAI';
  description = 'OpenAI provider';
  models = ['text-davinci-003', 'text-davinci-002', 'text-babbage-001', 'text-ada-001'];
  defaultModel = 'text-davinci-003';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation'];

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  async initialize(config: any): Promise<void> {
    // No initialization needed for OpenAI
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Not implemented for OpenAI
    throw new Error('Chat functionality not implemented for OpenAI');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getCurrentModel(): string {
    return this.defaultModel;
  }

  async setModel(model: string): Promise<void> {
    // Not implemented for OpenAI
    throw new Error('Model selection not implemented for OpenAI');
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
    try {
      const changesSummary = fileChanges.join('\n');
      const response = await generateText({
        model: this.client.chat.completions.create,
        prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
        maxTokens: options.maxLength,
        temperature: options.temperature
      });

      return response.text.trim();
    } catch (error) {
      logger.error('OpenAI commit message generation failed', error);
      throw error;
    }
  }
}

export class GroqLlamaProvider implements AIModelProvider {
  private client: ReturnType<typeof createOpenAI>;
  name = 'Groq Llama';
  description = 'Groq Llama provider';
  models = ['llama-3.1-70b-versatile'];
  defaultModel = 'llama-3.1-70b-versatile';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation'];

  constructor(apiKey?: string) {
    this.client = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: apiKey || process.env.GROQ_API_KEY
    });
  }

  async initialize(config: any): Promise<void> {
    // No initialization needed for Groq Llama
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Not implemented for Groq Llama
    throw new Error('Chat functionality not implemented for Groq Llama');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getCurrentModel(): string {
    return this.defaultModel;
  }

  async setModel(model: string): Promise<void> {
    // Not implemented for Groq Llama
    throw new Error('Model selection not implemented for Groq Llama');
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
    try {
      const changesSummary = fileChanges.join('\n');
      const response = await generateText({
        model: this.client('llama-3.1-70b-versatile'),
        prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
        maxTokens: options.maxLength,
        temperature: options.temperature
      });

      return response.text.trim();
    } catch (error) {
      logger.error('Groq Llama commit message generation failed', error);
      throw error;
    }
  }
}

export class BedrockLlamaProvider implements AIModelProvider {
  name = 'Amazon Bedrock Llama';
  description = 'Amazon Bedrock Llama provider';
  models = ['meta.llama3-1-405b-instruct-v1'];
  defaultModel = 'meta.llama3-1-405b-instruct-v1';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation'];

  async initialize(config: any): Promise<void> {
    // No initialization needed for Bedrock Llama
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Not implemented for Bedrock Llama
    throw new Error('Chat functionality not implemented for Bedrock Llama');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getCurrentModel(): string {
    return this.defaultModel;
  }

  async setModel(model: string): Promise<void> {
    // Not implemented for Bedrock Llama
    throw new Error('Model selection not implemented for Bedrock Llama');
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
    try {
      const changesSummary = fileChanges.join('\n');
      const response = await generateText({
        model: bedrock('meta.llama3-1-405b-instruct-v1'),
        prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
        maxTokens: options.maxLength,
        temperature: options.temperature
      });

      return response.text.trim();
    } catch (error) {
      logger.error('Bedrock Llama commit message generation failed', error);
      throw error;
    }
  }
}

export class AnthropicProvider implements AIModelProvider {
  name = 'Anthropic';
  description = 'Anthropic provider';
  models = ['claude-3-opus-20240229'];
  defaultModel = 'claude-3-opus-20240229';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation'];

  async initialize(config: any): Promise<void> {
    // No initialization needed for Anthropic
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Not implemented for Anthropic
    throw new Error('Chat functionality not implemented for Anthropic');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getCurrentModel(): string {
    return this.defaultModel;
  }

  async setModel(model: string): Promise<void> {
    // Not implemented for Anthropic
    throw new Error('Model selection not implemented for Anthropic');
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
    try {
      const changesSummary = fileChanges.join('\n');
      const response = await generateText({
        model: anthropic('claude-3-opus-20240229'),
        prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
        maxTokens: options.maxLength,
        temperature: options.temperature
      });

      return response.text.trim();
    } catch (error) {
      logger.error('Anthropic commit message generation failed', error);
      throw error;
    }
  }
}

export class GoogleProvider implements AIModelProvider {
  name = 'Google';
  description = 'Google provider';
  models = ['gemini-pro'];
  defaultModel = 'gemini-pro';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation'];

  async initialize(config: any): Promise<void> {
    // No initialization needed for Google
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Not implemented for Google
    throw new Error('Chat functionality not implemented for Google');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getCurrentModel(): string {
    return this.defaultModel;
  }

  async setModel(model: string): Promise<void> {
    // Not implemented for Google
    throw new Error('Model selection not implemented for Google');
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
    try {
      const changesSummary = fileChanges.join('\n');
      const response = await generateText({
        model: google('gemini-pro'),
        prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
        maxTokens: options.maxLength,
        temperature: options.temperature
      });

      return response.text.trim();
    } catch (error) {
      logger.error('Google commit message generation failed', error);
      throw error;
    }
  }
}

export class MistralProvider implements AIModelProvider {
  name = 'Mistral';
  description = 'Mistral provider';
  models = ['mistral-large-latest'];
  defaultModel = 'mistral-large-latest';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation'];

  async initialize(config: any): Promise<void> {
    // No initialization needed for Mistral
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Not implemented for Mistral
    throw new Error('Chat functionality not implemented for Mistral');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getCurrentModel(): string {
    return this.defaultModel;
  }

  async setModel(model: string): Promise<void> {
    // Not implemented for Mistral
    throw new Error('Model selection not implemented for Mistral');
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
    try {
      const changesSummary = fileChanges.join('\n');
      const response = await generateText({
        model: mistral('mistral-large-latest'),
        prompt: `Generate a concise git commit message for these changes:\n${changesSummary}`,
        maxTokens: options.maxLength,
        temperature: options.temperature
      });

      return response.text.trim();
    } catch (error) {
      logger.error('Mistral commit message generation failed', error);
      throw error;
    }
  }
}

export class OllamaProvider implements AIModelProvider {
  private ollamaService: OllamaInteractionService;
  name = 'Ollama';
  description = 'Ollama provider';
  models = [];
  defaultModel = '';
  maxTokens = 2048;
  supportedFeatures = ['commit-message-generation', 'chat'];

  constructor(config: Partial<OllamaConfig> = {}) {
    this.ollamaService = new OllamaInteractionService(config);
  }

  async initialize(config: any): Promise<void> {
    await this.ollamaService.initialize(config);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    return this.ollamaService.chat(formattedMessages);
  }

  async getAvailableModels(): Promise<string[]> {
    return this.ollamaService.getAvailableModels();
  }

  getCurrentModel(): string {
    return this.ollamaService.currentModel;
  }

  async setModel(model: string): Promise<void> {
    await this.ollamaService.setModel(model);
  }

  async generateCommitMessage(
    fileChanges: string[], 
    options = { maxLength: 72, temperature: 0.7 }
  ): Promise<string> {
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
    } catch (error) {
      logger.error('Ollama commit message generation failed', error);
      throw error;
    }
  }
}

export class ModelProviderFactory {
  private static providers: Record<string, new () => AIModelProvider> = {
    openai: OpenAIProvider,
    groq: GroqLlamaProvider,
    bedrock: BedrockLlamaProvider,
    anthropic: AnthropicProvider,
    google: GoogleProvider,
    mistral: MistralProvider,
    ollama: OllamaProvider
  };

  static async createProvider(
    providerName: string, 
    apiKey?: string
  ): Promise<AIModelProvider> {
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

  static registerProvider(
    name: string, 
    providerClass: new () => AIModelProvider
  ): void {
    this.providers[name.toLowerCase()] = providerClass;
  }
}

// Advanced Structured Commit Message Generation
export async function generateStructuredCommitMessage(
  fileChanges: string[],
  options?: {
    provider?: string;
    maxLength?: number;
    temperature?: number;
    returnType?: 'text' | 'object';
  }
): Promise<{
  message: string;
  metadata: {
    provider: string;
    length: number;
    fileTypes: string[];
    structuredData?: any;
  }
}> {
  const {
    provider = 'groq',
    maxLength = 72,
    temperature = 0.7,
    returnType = 'text'
  } = options || {};

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
    const commitMessage = await aiProvider.generateCommitMessage(
      fileChanges, 
      { maxLength, temperature }
    );

    return {
      message: commitMessage,
      metadata: {
        provider: aiProvider.name,
        length: commitMessage.length,
        fileTypes: [...new Set(
          fileChanges.map(change => change.split('.').pop() || 'unknown')
        )]
      }
    };
  } catch (error) {
    logger.error('Structured commit message generation failed', error);
    
    // Fallback mechanism
    const fallbackMessage = `Update ${fileChanges.length} file(s)`;
    return {
      message: fallbackMessage,
      metadata: {
        provider: 'fallback',
        length: fallbackMessage.length,
        fileTypes: [...new Set(
          fileChanges.map(change => change.split('.').pop() || 'unknown')
        )]
      }
    };
  }
}

// Streaming Commit Message Generation
export async function streamCommitMessage(
  fileChanges: string[],
  options?: {
    provider?: string;
    maxLength?: number;
    temperature?: number;
  }
): Promise<AsyncGenerator<string, void, unknown>> {
  const {
    provider = 'groq',
    maxLength = 72,
    temperature = 0.7
  } = options || {};

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
  } catch (error) {
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

export interface ModelProvider {
  complete(prompt: string): Promise<string>;
  chat(messages: ChatMessage[]): Promise<string>;
  analyzeCode(code: string): Promise<string>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderConfig {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class GroqProvider implements ModelProvider {
  private client: Groq;
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    this.client = new Groq(apiKey);
    this.config = {
      temperature: 0.7,
      maxTokens: 1000,
      model: 'mixtral-8x7b-32768',
      ...config
    };
  }

  async complete(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Groq completion failed:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Groq chat failed:', error);
      throw error;
    }
  }

  async analyzeCode(code: string): Promise<string> {
    const prompt = `
      Please analyze this code and provide insights about its functionality,
      potential improvements, and any issues you notice:

      \`\`\`
      ${code}
      \`\`\`
    `;

    return this.complete(prompt);
  }

  updateConfig(config: Partial<ProviderConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  getConfig(): ProviderConfig {
    return { ...this.config };
  }
}

export class ModelProviderFactory {
  static async createProvider(
    type: string,
    config?: ProviderConfig
  ): Promise<ModelProvider> {
    switch (type.toLowerCase()) {
      case 'groq':
        return new GroqProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }
}

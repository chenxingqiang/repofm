import { OpenAI } from 'openai';
import type { ChatMessage } from '../services/OllamaInteractionService.js';
import { Message } from 'ai';
import { z } from 'zod';
import { logger } from '../shared/logger.js';
import { OllamaInteractionService } from '../services/OllamaInteractionService.js';

export interface AIModelProvider {
  name: string;
  generateText(prompt: string, options?: any): Promise<string>;
  generateObject<T>(prompt: string, schema: z.ZodSchema<T>, options?: any): Promise<T>;
  streamText(prompt: string, options?: any): Promise<{ textStream: AsyncIterable<string> }>;
}

export class OpenAIProvider implements AIModelProvider {
  private client: OpenAI;
  name = 'OpenAI';

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxLength,
        temperature: options?.temperature
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('OpenAI text generation failed', error);
      throw error;
    }
  }

  async generateObject<T>(prompt: string, schema: z.ZodSchema<T>, options?: any): Promise<T> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxLength,
        temperature: options?.temperature
      });

      const data = JSON.parse(response.choices[0]?.message?.content || '{}');
      return schema.parse(data);
    } catch (error) {
      logger.error('OpenAI object generation failed', error);
      throw error;
    }
  }

  async streamText(prompt: string, options?: any): Promise<{ textStream: AsyncIterable<string> }> {
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
    } catch (error) {
      logger.error('OpenAI text streaming failed', error);
      throw error;
    }
  }
}

export interface OllamaConfig {
  model?: string;
  baseUrl?: string;
}

export class OllamaProvider implements AIModelProvider {
  isAvailable() {
    throw new Error('Method not implemented.');
  }
  setModel(selectedModel: any) {
    throw new Error('Method not implemented.');
  }
  getConfig() {
    return this.ollamaService.getConfigOptions();
  }
  generateCommitMessage(fileChanges: string[]) {
    throw new Error('Method not implemented.');
  }
  chat(chatMessages: import("../services/OllamaInteractionService.js").ChatMessage[]) {
    throw new Error('Method not implemented.');
  }
  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.ollamaService.listLocalModels();
      return models.map(model => model.name);
    } catch (error) {
      logger.error('Failed to get available models', error);
      return [];
    }
  }
  private ollamaService: OllamaInteractionService;
  name = 'Ollama';

  constructor(config: Partial<OllamaConfig> = {}) {
    this.ollamaService = new OllamaInteractionService(config);
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const response = await this.ollamaService.generateText(prompt, {
        maxTokens: options?.maxLength,
        temperature: options?.temperature
      });

      return response.trim();
    } catch (error) {
      logger.error('Ollama text generation failed', error);
      throw error;
    }
  }

  async generateObject<T>(prompt: string, schema: z.ZodSchema<T>, options?: any): Promise<T> {
    try {
      const response = await this.ollamaService.generateText(prompt, {
        maxTokens: options?.maxLength,
        temperature: options?.temperature
      });

      const data = JSON.parse(response);
      return schema.parse(data);
    } catch (error) {
      logger.error('Ollama object generation failed', error);
      throw error;
    }
  }

  async streamText(prompt: string, options?: any): Promise<{ textStream: AsyncIterable<string> }> {
    try {
      const response = await this.ollamaService.streamText(prompt, {
        maxTokens: options?.maxLength,
        temperature: options?.temperature
      });

      return { textStream: response.stream };
    } catch (error) {
      logger.error('Ollama text streaming failed', error);
      throw error;
    }
  }
}

export class ModelProviderFactory {
  private static instance: ModelProviderFactory;
  private providers: Map<string, AIModelProvider> = new Map();

  private constructor() {
    // Initialize with available providers
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new OllamaProvider());
  }

  public static getInstance(): ModelProviderFactory {
    if (!ModelProviderFactory.instance) {
      ModelProviderFactory.instance = new ModelProviderFactory();
    }
    return ModelProviderFactory.instance;
  }

  public registerProvider(provider: AIModelProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProvider(name: string): AIModelProvider | undefined {
    return this.providers.get(name);
  }

  public getAllProviders(): AIModelProvider[] {
    return Array.from(this.providers.values());
  }

  public async createProvider(providerName: string, apiKey?: string): Promise<AIModelProvider> {
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

export interface CommitMessageMetadata {
  provider: string;
  length: number;
  fileTypes: string[];
}

export interface StructuredCommitResult {
  message: string;
  metadata: CommitMessageMetadata;
}

export async function generateStructuredCommitMessage(
  stagedFiles: string[],
  options: { provider?: string; maxLength?: number; temperature?: number } = {}
): Promise<StructuredCommitResult> {
  const { provider: providerName = 'ollama', maxLength = 72, temperature = 0.7 } = options;

  // Derive file types from staged files
  const fileTypes = [...new Set(
    stagedFiles.map(f => f.split('.').pop() || 'unknown')
  )];

  const factory = ModelProviderFactory.getInstance();
  const provider = await factory.createProvider(providerName);

  const prompt = [
    'Generate a concise, meaningful git commit message (imperative mood, max ' + maxLength + ' chars).',
    'Staged files: ' + stagedFiles.join(', '),
    'Reply with only the commit message text, nothing else.',
  ].join('\n');

  let message: string;
  try {
    message = await provider.generateText(prompt, { maxLength, temperature });
    // Trim to maxLength
    message = message.trim().split('\n')[0].substring(0, maxLength);
  } catch {
    message = `Update ${stagedFiles.length} file(s)`;
  }

  return {
    message,
    metadata: {
      provider: providerName,
      length: message.length,
      fileTypes,
    },
  };
}

import { z } from 'zod';
declare const OllamaConfigSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    topK: z.ZodOptional<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    repeatPenalty: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxTokens: number;
    model: string;
    temperature: number;
    systemPrompt?: string | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    repeatPenalty?: number | undefined;
}, {
    maxTokens?: number | undefined;
    model?: string | undefined;
    temperature?: number | undefined;
    systemPrompt?: string | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    repeatPenalty?: number | undefined;
}>;
export type OllamaConfig = z.infer<typeof OllamaConfigSchema>;
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modifiedAt: Date;
    details?: {
        format?: string;
        family?: string;
        parameter_size?: string;
        quantization_level?: string;
    };
}
export declare class OllamaInteractionService {
    private config;
    private availableModels;
    private currentModel;
    constructor(config?: Partial<OllamaConfig>);
    private initializeModels;
    isOllamaRunning(): Promise<boolean>;
    listLocalModels(): Promise<OllamaModel[]>;
    setModel(modelName: string): Promise<boolean>;
    pullModel(modelName: string): Promise<boolean>;
    generateText(prompt: string, options?: {
        maxTokens?: number;
        temperature?: number;
    }): Promise<string>;
    streamText(prompt: string, options?: {
        maxTokens?: number;
        temperature?: number;
    }): Promise<{
        stream: AsyncIterable<string>;
    }>;
    interactiveChat(): Promise<void>;
    validateConfig(config: z.ZodType): Promise<boolean>;
    getConfigOptions(): Record<string, any>;
}
export declare const ollamaService: OllamaInteractionService;
export {};

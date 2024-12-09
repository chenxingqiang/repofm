import { z } from 'zod';
export declare const ModelCapabilitySchema: z.ZodObject<{
    provider: z.ZodString;
    modelName: z.ZodString;
    capabilities: z.ZodObject<{
        imageInput: z.ZodDefault<z.ZodBoolean>;
        objectGeneration: z.ZodDefault<z.ZodBoolean>;
        toolUsage: z.ZodDefault<z.ZodBoolean>;
        toolStreaming: z.ZodDefault<z.ZodBoolean>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        contextWindowSize: z.ZodOptional<z.ZodNumber>;
        specializedTasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        imageInput: boolean;
        objectGeneration: boolean;
        toolUsage: boolean;
        toolStreaming: boolean;
        maxTokens?: number | undefined;
        contextWindowSize?: number | undefined;
        specializedTasks?: string[] | undefined;
    }, {
        maxTokens?: number | undefined;
        imageInput?: boolean | undefined;
        objectGeneration?: boolean | undefined;
        toolUsage?: boolean | undefined;
        toolStreaming?: boolean | undefined;
        contextWindowSize?: number | undefined;
        specializedTasks?: string[] | undefined;
    }>;
    pricing: z.ZodOptional<z.ZodObject<{
        inputTokenPrice: z.ZodOptional<z.ZodNumber>;
        outputTokenPrice: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        inputTokenPrice?: number | undefined;
        outputTokenPrice?: number | undefined;
    }, {
        inputTokenPrice?: number | undefined;
        outputTokenPrice?: number | undefined;
        currency?: string | undefined;
    }>>;
    recommendedUseCases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    localDeployment: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: string;
    modelName: string;
    capabilities: {
        imageInput: boolean;
        objectGeneration: boolean;
        toolUsage: boolean;
        toolStreaming: boolean;
        maxTokens?: number | undefined;
        contextWindowSize?: number | undefined;
        specializedTasks?: string[] | undefined;
    };
    localDeployment: boolean;
    pricing?: {
        currency: string;
        inputTokenPrice?: number | undefined;
        outputTokenPrice?: number | undefined;
    } | undefined;
    recommendedUseCases?: string[] | undefined;
}, {
    provider: string;
    modelName: string;
    capabilities: {
        maxTokens?: number | undefined;
        imageInput?: boolean | undefined;
        objectGeneration?: boolean | undefined;
        toolUsage?: boolean | undefined;
        toolStreaming?: boolean | undefined;
        contextWindowSize?: number | undefined;
        specializedTasks?: string[] | undefined;
    };
    pricing?: {
        inputTokenPrice?: number | undefined;
        outputTokenPrice?: number | undefined;
        currency?: string | undefined;
    } | undefined;
    recommendedUseCases?: string[] | undefined;
    localDeployment?: boolean | undefined;
}>;
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;
interface ModelCapabilities {
    imageInput: boolean;
    objectGeneration: boolean;
    toolUsage: boolean;
    toolStreaming: boolean;
    maxTokens?: number;
    contextWindowSize?: number;
    specializedTasks?: string[];
    [key: string]: boolean | number | string[] | undefined;
}
interface ModelInfo {
    provider: string;
    modelName: string;
    capabilities: ModelCapabilities;
    localDeployment: boolean;
    pricing?: {
        inputTokenPrice: number;
        outputTokenPrice: number;
        currency: string;
    };
    recommendedUseCases?: string[];
}
export declare class ModelCapabilityAnalyzer {
    private readonly models;
    constructor();
    private initializeModels;
    hasCapability(modelName: string, capability: keyof ModelCapabilities): boolean;
    getModelInfo(modelName: string): ModelInfo | undefined;
    listModels(): string[];
}
export declare const modelAnalyzer: typeof ModelCapabilityAnalyzer;
export {};

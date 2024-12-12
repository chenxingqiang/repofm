import { z } from 'zod';

// Comprehensive model capability schema
export const ModelCapabilitySchema = z.object({
  provider: z.string(),
  modelName: z.string(),
  capabilities: z.object({
    imageInput: z.boolean().default(false),
    objectGeneration: z.boolean().default(false),
    toolUsage: z.boolean().default(false),
    toolStreaming: z.boolean().default(false),
    maxTokens: z.number().optional(),
    contextWindowSize: z.number().optional(),
    specializedTasks: z.array(z.string()).optional()
  }),
  pricing: z.object({
    inputTokenPrice: z.number().optional(),
    outputTokenPrice: z.number().optional(),
    currency: z.string().default('USD')
  }).optional(),
  recommendedUseCases: z.array(z.string()).optional(),
  localDeployment: z.boolean().default(false)
});

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

export class ModelCapabilityAnalyzer {
  private static instance: ModelCapabilityAnalyzer;
  private readonly models: Map<string, ModelInfo> = new Map();

  private constructor() {
    this.initializeModels();
  }

  public static getInstance(): ModelCapabilityAnalyzer {
    if (!ModelCapabilityAnalyzer.instance) {
      ModelCapabilityAnalyzer.instance = new ModelCapabilityAnalyzer();
    }
    return ModelCapabilityAnalyzer.instance;
  }

  static recommendModelForUseCase(useCase: string): ModelInfo | null {
    const instance = ModelCapabilityAnalyzer.getInstance();
    const models = Array.from(instance.models.values());
    
    // Simple recommendation logic based on use case keywords
    const recommendedModel = models.find(model => 
      model.recommendedUseCases?.some(recommendedUseCase => 
        useCase.toLowerCase().includes(recommendedUseCase.toLowerCase())
      )
    );

    return recommendedModel || null;
  }

  static generateCapabilityReport(modelName: string): string | null {
    const instance = ModelCapabilityAnalyzer.getInstance();
    const model = instance.models.get(modelName);

    if (!model) return null;

    return `
Model: ${model.modelName} (${model.provider})
Capabilities:
  - Image Input: ${model.capabilities.imageInput ? 'Yes' : 'No'}
  - Object Generation: ${model.capabilities.objectGeneration ? 'Yes' : 'No'}
  - Tool Usage: ${model.capabilities.toolUsage ? 'Yes' : 'No'}
  - Tool Streaming: ${model.capabilities.toolStreaming ? 'Yes' : 'No'}
  - Max Tokens: ${model.capabilities.maxTokens}
  - Context Window: ${model.capabilities.contextWindowSize}

Recommended Use Cases:
${model.recommendedUseCases?.map(useCase => `  - ${useCase}`).join('\n') || 'None specified'}

Local Deployment: ${model.localDeployment ? 'Supported' : 'Not Supported'}
    `;
  }

  static compareModels(modelNames: string[]): ModelInfo[] {
    const instance = ModelCapabilityAnalyzer.getInstance();
    return modelNames
      .map(name => instance.models.get(name))
      .filter((model): model is ModelInfo => model !== undefined);
  }

  static getOllamaModels(): ModelInfo[] {
    const instance = ModelCapabilityAnalyzer.getInstance();
    return Array.from(instance.models.values())
      .filter(model => model.localDeployment);
  }

  static getOllamaDeploymentGuide(modelName: string): string | null {
    const instance = ModelCapabilityAnalyzer.getInstance();
    const model = instance.models.get(modelName);

    if (!model || !model.localDeployment) return null;

    return `
Deployment Guide for ${modelName}:
1. Ensure Ollama is installed (https://ollama.com/download)
2. Pull the model: \`ollama pull ${modelName}\`
3. Verify installation: \`ollama list\`
4. Start using the model in your applications

Recommended System Requirements:
  - CPU: x86_64 architecture
  - RAM: At least 8GB (16GB recommended)
  - Disk Space: Varies by model size
    `;
  }

  static findModelsByCapabilities(capabilitiesMap: ModelCapabilities): ModelInfo[] {
    const instance = ModelCapabilityAnalyzer.getInstance();
    return Array.from(instance.models.values())
      .filter(model => 
        Object.entries(capabilitiesMap).every(([key, value]) => 
          model.capabilities[key] === value
        )
      );
  }

  private initializeModels() {
    // Initialize with default model capabilities
    const defaultCapabilities: ModelCapabilities = {
      imageInput: false,
      objectGeneration: false,
      toolUsage: false,
      toolStreaming: false,
      maxTokens: 4096,
      contextWindowSize: 4096
    };

    // OpenAI Models
    this.models.set('gpt-4o', {
      provider: 'OpenAI',
      modelName: 'gpt-4o',
      capabilities: {
        ...defaultCapabilities,
        imageInput: true,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 128000
      },
      pricing: {
        inputTokenPrice: 0.005,
        outputTokenPrice: 0.015,
        currency: 'USD'
      },
      recommendedUseCases: [
        'Complex reasoning',
        'Multimodal tasks',
        'Code generation',
        'Creative writing'
      ],
      localDeployment: false
    });

    this.models.set('gpt-4-turbo', {
      provider: 'OpenAI',
      modelName: 'gpt-4-turbo',
      capabilities: {
        ...defaultCapabilities,
        imageInput: true,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 128000
      },
      recommendedUseCases: [
        'Advanced problem solving',
        'Technical writing',
        'Code analysis'
      ],
      localDeployment: false
    });

    // Anthropic Models
    this.models.set('claude-3-5-sonnet-20241022', {
      provider: 'Anthropic',
      modelName: 'claude-3-5-sonnet-20241022',
      capabilities: {
        ...defaultCapabilities,
        imageInput: true,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 200000
      },
      recommendedUseCases: [
        'Precise analysis',
        'Long-context tasks',
        'Research assistance'
      ],
      localDeployment: false
    });

    // Mistral Models
    this.models.set('mistral-large-latest', {
      provider: 'Mistral',
      modelName: 'mistral-large-latest',
      capabilities: {
        ...defaultCapabilities,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 32000
      },
      recommendedUseCases: [
        'Code generation',
        'Multilingual tasks',
        'Compact reasoning'
      ],
      localDeployment: false
    });

    // Google Models
    this.models.set('gemini-1.5-pro', {
      provider: 'Google',
      modelName: 'gemini-1.5-pro',
      capabilities: {
        ...defaultCapabilities,
        imageInput: true,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 1000000
      },
      recommendedUseCases: [
        'Extremely long context',
        'Multimodal reasoning',
        'Complex problem solving'
      ],
      localDeployment: false
    });

    // Groq Models
    this.models.set('llama-3.1-70b-versatile', {
      provider: 'Groq',
      modelName: 'llama-3.1-70b-versatile',
      capabilities: {
        ...defaultCapabilities,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 70000
      },
      recommendedUseCases: [
        'Versatile language tasks',
        'Reasoning',
        'Code understanding'
      ],
      localDeployment: false
    });

    // Ollama Local Models
    this.models.set('llama3.1', {
      provider: 'Ollama',
      modelName: 'llama3.1',
      capabilities: {
        ...defaultCapabilities,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 8192,
        specializedTasks: ['coding', 'reasoning', 'general conversation']
      },
      localDeployment: true,
      recommendedUseCases: [
        'Local AI development',
        'Privacy-focused applications',
        'Offline AI interactions'
      ]
    });

    this.models.set('mistral', {
      provider: 'Ollama',
      modelName: 'mistral',
      capabilities: {
        ...defaultCapabilities,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 4096,
        contextWindowSize: 32000,
        specializedTasks: ['multilingual', 'code generation']
      },
      localDeployment: true,
      recommendedUseCases: [
        'Local development',
        'Code generation',
        'Multilingual tasks'
      ]
    });

    this.models.set('phi3', {
      provider: 'Ollama',
      modelName: 'phi3',
      capabilities: {
        ...defaultCapabilities,
        objectGeneration: true,
        toolUsage: true,
        toolStreaming: true,
        maxTokens: 2048,
        contextWindowSize: 4096,
        specializedTasks: ['lightweight tasks', 'educational']
      },
      localDeployment: true,
      recommendedUseCases: [
        'Educational applications',
        'Lightweight AI tasks',
        'Resource-constrained environments'
      ]
    });

    this.models.set('llama2', {
      provider: 'Ollama',
      modelName: 'llama2',
      capabilities: {
        ...defaultCapabilities,
        toolUsage: true,
        maxTokens: 4096
      },
      localDeployment: true,
      recommendedUseCases: ['General text generation', 'Code assistance']
    });

    this.models.set('codellama', {
      provider: 'Ollama',
      modelName: 'codellama',
      capabilities: {
        ...defaultCapabilities,
        toolUsage: true,
        maxTokens: 4096,
        specializedTasks: ['code']
      },
      localDeployment: true,
      recommendedUseCases: ['Code generation', 'Code analysis']
    });
  }

  hasCapability(modelName: string, capability: keyof ModelCapabilities): boolean {
    const model = this.models.get(modelName);
    if (!model) {
      return false;
    }
    return !!model.capabilities[capability];
  }

  getModelInfo(modelName: string): ModelInfo | undefined {
    return this.models.get(modelName);
  }

  listModels(): string[] {
    return Array.from(this.models.keys());
  }
}

// Export for easy import and use
export const modelAnalyzer = ModelCapabilityAnalyzer;

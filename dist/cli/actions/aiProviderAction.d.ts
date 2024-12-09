import { OllamaModel } from '../../services/OllamaInteractionService.js';
export declare function configureAIProviders(): Promise<void>;
export declare function listAIProviders(): Promise<{
    value: OllamaModel;
    label: string;
    hint: string;
}[]>;
export declare function removeAIProvider(): Promise<void>;

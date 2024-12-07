import type { repofmConfigMerged } from '../../config/configSchema.js';
import type { ProcessedFile, RawFile, OutputConfig } from './fileTypes.js';
interface ProcessConfig {
    output?: OutputConfig;
}
export declare const processFiles: (rawFiles: RawFile[], config: repofmConfigMerged) => Promise<ProcessedFile[]>;
export declare const processContent: (content: string | null, filePath: string, config?: ProcessConfig) => Promise<string>;
export {};

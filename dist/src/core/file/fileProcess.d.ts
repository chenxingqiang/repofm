import type { repofmConfigMerged } from '../../config/configSchema.js';
import type { ProcessedFile, RawFile } from './fileTypes.js';
export declare const processFiles: (rawFiles: RawFile[], config: repofmConfigMerged) => Promise<ProcessedFile[]>;
export declare const processContent: (content: string, filePath: string, config: repofmConfigMerged) => Promise<string>;
//# sourceMappingURL=fileProcess.d.ts.map
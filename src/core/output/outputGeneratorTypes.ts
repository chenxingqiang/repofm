import type { repofmConfigMerged } from '../../config/configSchema.js';
import type { ProcessedFile } from '../file/fileTypes.js';

export interface OutputGeneratorContext {
  generationDate: string;
  treeString: string;
  processedFiles: ProcessedFile[];
  config: repofmConfigMerged;
  instruction: string;
}

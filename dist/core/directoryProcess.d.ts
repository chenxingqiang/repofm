import { repofmConfigMerged } from '../config/configSchema.js';
declare function processDirectory(targetDir: string, config: repofmConfigMerged): Promise<string>;
export { processDirectory };

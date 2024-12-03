import { repofmConfigMerged } from '../config/configSchema.js';
import { logger } from '../shared/logger.js';
import { generateOutput } from './packager';

export async function processDirectory(
  targetDir: string,
  config: repofmConfigMerged
): Promise<string> {
  logger.debug(`Processing directory: ${targetDir}`);

  const result = await generateOutput(targetDir, config);

  return result.toString();
}

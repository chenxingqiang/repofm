import { repofmConfigMerged } from '../config/configSchema.js';
import { logger } from '../shared/logger.js';
import { pack } from './packager.js';

export async function processDirectory(
  targetDir: string,
  config: repofmConfigMerged
): Promise<string> {
  logger.debug(`Processing directory: ${targetDir}`);

  const result = await pack(targetDir, config);

  return result.toString();
}

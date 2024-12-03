import clipboardy from 'clipboardy';
import { loadConfig } from '../../config/configLoad.js';
import { processDirectory } from '../../core/index.js';
import { logger } from '../../shared/logger.js';
import * as fs from 'node:fs/promises';
import { defaultConfig } from '../../config/configSchema.js';
import type { Config } from '../../types/config.js';

interface DefaultActionParams {
  config: Config;
  workingDir: string;
}

export async function runDefaultAction({
  config,
  workingDir
}: DefaultActionParams): Promise<boolean> {
  try {
    const result = await processDirectory(workingDir, config);

    if (config.output.filePath) {
      await fs.writeFile(config.output.filePath, result, 'utf-8');
      logger.info(`Output written to: ${config.output.filePath}`);
    }

    if (config.output.copyToClipboard) {
      await clipboardy.write(result);
      logger.info('Output copied to clipboard');
    }

    logger.success('Successfully processed directory');
    return true;
  } catch (error) {
    logger.error('Error in default action:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

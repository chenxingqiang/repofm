import clipboardy from 'clipboardy';
import { loadConfig } from '../../config/configLoad.js';
import { processDirectory } from '../../core/index.js';
import { logger } from '../../shared/logger.js';
import * as fs from 'node:fs/promises';
import { defaultConfig, type repofmConfigMerged } from '../../config/configSchema.js';

interface DefaultActionOptions {
  copyToClipboard?: boolean;
  outputPath?: string;
  verbose?: boolean;
  global?: boolean;
  target?: string;
  type?: string;
  depth?: number;
  format?: string;
  range?: string;
}

export async function runDefaultAction(
  targetDir: string,
  configPath: string,
  options: DefaultActionOptions = {}
): Promise<void> {
  try {
    // Load config with defaults
    const userConfig = (await loadConfig(configPath, {
      global: options.global,
      verbose: options.verbose
    })) as repofmConfigMerged;

    // Merge with default config
    const config: repofmConfigMerged = {
      ...defaultConfig,
      ...userConfig,
      output: {
        ...defaultConfig.output,
        ...(userConfig.output || {}),
        copyToClipboard: options.copyToClipboard ?? userConfig.output?.copyToClipboard ?? defaultConfig.output.copyToClipboard,
        filePath: options.outputPath ?? userConfig.output?.filePath ?? defaultConfig.output.filePath,
      },
      include: userConfig.include || defaultConfig.include,
      ignore: {
        ...defaultConfig.ignore,
        ...(userConfig.ignore || {}),
      },
      security: {
        ...defaultConfig.security,
        ...(userConfig.security || {}),
      },
      cwd: userConfig.cwd || process.cwd()
    };

    const result = await processDirectory(targetDir, config);

    if (options.outputPath) {
      await writeOutput(options.outputPath, result);
      logger.info(`Output written to: ${options.outputPath}`);
    } else {
      console.log(result);
    }

    if (options.copyToClipboard) {
      await clipboardy.write(result);
      logger.info('Output copied to clipboard');
    }
  } catch (error) {
    logger.error('Error in default action:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function writeOutput(outputPath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(outputPath, content, 'utf-8');
  } catch (error) {
    logger.error(`Error writing to ${outputPath}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

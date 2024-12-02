import * as fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { repofmError, repofmConfigValidationError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import {
  type repofmConfigCli,
  type repofmConfigFile,
  type repofmConfigMerged,
  defaultConfig,
  defaultFilePathMap,
  repofmConfigFileSchema,
  repofmConfigMergedSchema,
} from './configSchema.js';
import { getGlobalDirectory } from './globalDirectory.js';

const defaultConfigPath = 'repofm.config.json';

export async function loadFileConfig(rootDir: string, argConfigPath: string | null): Promise<repofmConfigFile> {
  let useDefaultConfig = false;
  let configPath = argConfigPath;
  if (!configPath) {
    useDefaultConfig = true;
    configPath = defaultConfigPath;
  }

  const fullPath = path.resolve(rootDir, configPath);
  logger.trace(`Loading local config from: ${fullPath}`);

  try {
    await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return await parseAndValidateConfig(content, fullPath);
  } catch (error) {
    if (error instanceof repofmConfigValidationError || (error instanceof Error && error.message === 'Invalid JSON')) {
      throw error;
    }

    if (!useDefaultConfig) {
      throw new repofmError(`Config file not found at ${configPath}`);
    }

    const globalConfigPath = path.join(getGlobalDirectory(), 'repofm.config.json');
    logger.trace(`Loading global config from: ${globalConfigPath}`);

    try {
      await fs.stat(globalConfigPath);
      const content = await fs.readFile(globalConfigPath, 'utf-8');
      return await parseAndValidateConfig(content, globalConfigPath);
    } catch (error) {
      if (error instanceof repofmConfigValidationError || (error instanceof Error && error.message === 'Invalid JSON')) {
        throw error;
      }
      logger.info(
        `No custom config found at ${configPath} or global config at ${globalConfigPath}.\nYou can add a config file for additional settings.`
      );
      return {};
    }
  }
}

async function parseAndValidateConfig(content: string, filePath: string): Promise<repofmConfigFile> {
  let config;
  try {
    config = JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON');
  }

  try {
    return repofmConfigFileSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `[${issue.path.join('.')}] ${issue.message}`
      ).join('\n');
      throw new repofmConfigValidationError(
        `Invalid config file:\n${issues}`
      );
    }
    throw new repofmConfigValidationError(
      `Error validating config from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export const mergeConfigs = (
  cwd: string,
  fileConfig: repofmConfigFile,
  cliConfig: repofmConfigCli,
): repofmConfigMerged => {
  logger.trace(`Default config: ${JSON.stringify(defaultConfig)}`);

  const baseConfig = defaultConfig;

  if (cliConfig.output?.filePath == null && fileConfig.output?.filePath == null) {
    const style = cliConfig.output?.style || fileConfig.output?.style || baseConfig.output.style;
    baseConfig.output.filePath = defaultFilePathMap[style];
    logger.trace(`Default output file path is set to: ${baseConfig.output.filePath}`);
  }

  const mergedConfig = {
    cwd,
    output: {
      ...baseConfig.output,
      ...fileConfig.output,
      ...cliConfig.output,
    },
    include: [...(baseConfig.include || []), ...(fileConfig.include || []), ...(cliConfig.include || [])],
    ignore: {
      ...baseConfig.ignore,
      ...fileConfig.ignore,
      ...cliConfig.ignore,
      customPatterns: [
        ...(baseConfig.ignore.customPatterns || []),
        ...(fileConfig.ignore?.customPatterns || []),
        ...(cliConfig.ignore?.customPatterns || []),
      ],
    },
    security: {
      ...baseConfig.security,
      ...fileConfig.security,
      ...cliConfig.security,
    },
  };

  try {
    return repofmConfigMergedSchema.parse(mergedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `[${issue.path.join('.')}] ${issue.message}`
      ).join('\n');
      throw new repofmConfigValidationError(
        `Invalid merged config:\n${issues}`
      );
    }
    throw error;
  }
};

export interface LoadConfigOptions {
  global?: boolean;
  verbose?: boolean;
}

export async function loadConfig(configPath: string, options: LoadConfigOptions = {}) {
  // Implementation here
  const config = {
    // Your config implementation
  };
  return config;
}

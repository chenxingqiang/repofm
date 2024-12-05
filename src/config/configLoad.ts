import * as fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { repofmError, repofmConfigValidationError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import type { Config, CliOptions } from '../types/config.js';
import { getGlobalDirectory } from './globalDirectory.js';
import { loadFileConfig } from './path/to/loadFileConfig';

const defaultFilePathMap = {
  plain: 'output.txt',
  xml: 'output.xml',
  markdown: 'output.md'
} as const;

export function createDefaultConfig(cwd: string, options: Partial<CliOptions & Config> = {}): Config {
  return {
    output: {
      filePath: options.output || defaultFilePathMap.plain,
      style: 'plain',
      removeComments: false,
      removeEmptyLines: false,
      topFilesLength: 10,
      showLineNumbers: false,
      copyToClipboard: options.copy || false,
      headerText: 'Repository Content',
      instructionFilePath: ''
    },
    include: options.include || [],
    ignore: {
      customPatterns: options.ignore?.customPatterns || [],
      useDefaultPatterns: true,
      useGitignore: true,
      excludePatterns: ['node_modules/**', '.git/**']
    },
    security: {
      enableSecurityCheck: options.security || false
    },
    cwd
  };
}

const configSchema = z.object({
  output: z.object({
    filePath: z.string(),
    style: z.enum(['plain', 'xml', 'markdown']),
    removeComments: z.boolean(),
    removeEmptyLines: z.boolean(),
    topFilesLength: z.number(),
    showLineNumbers: z.boolean(),
    copyToClipboard: z.boolean(),
    headerText: z.string(),
    instructionFilePath: z.string()
  }),
  include: z.array(z.string()),
  ignore: z.object({
    customPatterns: z.array(z.string()),
    useDefaultPatterns: z.boolean(),
    useGitignore: z.boolean(),
    excludePatterns: z.array(z.string())
  }),
  security: z.object({
    enableSecurityCheck: z.boolean()
  }),
  cwd: z.string().optional()
});

export async function loadFileConfig(
  cwd: string,
  configFile: string | null = null
): Promise<Partial<Config>> {
  try {
    // Try local config first
    const localConfigPath = configFile || path.join(cwd, 'repofm.config.json');
    try {
      await fs.stat(localConfigPath);
      const configContent = await fs.readFile(localConfigPath, 'utf-8');
      const parsedConfig = JSON.parse(configContent);
      return configSchema.parse(parsedConfig);
    } catch (error) {
      // If local config not found or invalid, try global config
      const globalDir = getGlobalDirectory();
      const globalConfigPath = path.join(globalDir, 'repofm.config.json');
      
      try {
        await fs.stat(globalConfigPath);
        const configContent = await fs.readFile(globalConfigPath, 'utf-8');
        const parsedConfig = JSON.parse(configContent);
        return configSchema.parse(parsedConfig);
      } catch (globalError) {
        // No config found, return empty object
        logger.info('No custom config found, using defaults');
        return {};
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new repofmConfigValidationError('Invalid config file', error);
    }
    if (error instanceof SyntaxError) {
      throw new repofmError('Invalid JSON in config file');
    }
    throw error;
  }
}

export function mergeConfigs(
  cwd: string,
  fileConfig: Partial<Config> = {},
  cliConfig: Partial<CliOptions> = {}
): Config {
  const defaultConfig = createDefaultConfig(cwd);
  
  return {
    ...defaultConfig,
    ...fileConfig,
    cwd,
    output: {
      ...defaultConfig.output,
      ...fileConfig.output,
      ...(typeof cliConfig.output === 'string' ? { filePath: cliConfig.output } : {}),
      copyToClipboard: cliConfig.copy ?? fileConfig.output?.copyToClipboard ?? defaultConfig.output.copyToClipboard
    },
    security: {
      ...defaultConfig.security,
      ...fileConfig.security,
      enableSecurityCheck: cliConfig.security ?? fileConfig.security?.enableSecurityCheck ?? defaultConfig.security.enableSecurityCheck
    }
  };
}

export async function loadConfig(
  cwd: string,
  options: { global?: boolean } = {}
): Promise<Config> {
  try {
    const fileConfig = await loadFileConfig(cwd);
    return mergeConfigs(cwd, fileConfig, options);
  } catch (error) {
    logger.error('Error loading config:', error);
    return createDefaultConfig(cwd, options);
  }
}

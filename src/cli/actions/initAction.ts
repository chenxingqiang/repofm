import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors.js';
import {
  type repofmOutputStyle,
  defaultConfig,
  defaultFilePathMap,
} from '../../config/configSchema.js';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';
import type { Config, OutputConfig } from '../../types/config.js';

export const runInitAction = async (rootDir: string = process.cwd(), isGlobal = false): Promise<void> => {
  try {
    const targetDir = isGlobal ? await getGlobalDirectory() : rootDir;

    logger.info(`Initializing repofm in ${targetDir}`);

    // 创建配置文件
    await createConfigFile(targetDir, isGlobal);

    // 创建忽略文件
    await createIgnoreFile(targetDir, isGlobal);

    logger.info('Initialization completed successfully!');
  } catch (error) {
    logger.error('Error during initialization:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function createConfigFile(rootDir: string, isGlobal: boolean): Promise<boolean> {
  const configPath = isGlobal
    ? path.resolve(await getGlobalDirectory(), 'repofm.config.json')
    : path.resolve(rootDir, 'repofm.config.json');

  try {
    // 检查文件是否已存在
    try {
      await fs.access(configPath);
      logger.info(`Configuration file already exists at ${configPath}`);
      return false;
    } catch {
      // 文件不存在，继续创建
    }

    // 使用默认配置
    const defaultConfiguration: Config = {
      ...defaultConfig,
      cwd: rootDir,
      output: {
        ...defaultConfig.output,
        headerText: defaultConfig.output.headerText || 'Repository Content',
        instructionFilePath: defaultConfig.output.instructionFilePath || ''
      },
      ignore: {
        ...defaultConfig.ignore,
        excludePatterns: ['node_modules/**', '.git/**']
      }
    };

    // 写入配置文件
    await fs.writeFile(
      configPath, 
      JSON.stringify(defaultConfiguration, null, 2), 
      'utf-8'
    );

    logger.info(`Created configuration file at ${configPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to create configuration file: ${error}`);
    throw error;
  }
}

export async function createIgnoreFile(rootDir: string, isGlobal: boolean): Promise<boolean> {
  const ignorePath = isGlobal
    ? path.resolve(await getGlobalDirectory(), '.repofmignore')
    : path.resolve(rootDir, '.repofmignore');

  try {
    // 检查文件是否已存在
    try {
      await fs.access(ignorePath);
      logger.info(`Ignore file already exists at ${ignorePath}`);
      return false;
    } catch {
      // 文件不存在，继续创建
    }

    // 使用默认忽略模式
    const defaultIgnorePatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'lib/',
      '**/*.log',
      '**/*.tmp'
    ];

    // 写入忽略文件
    await fs.writeFile(
      ignorePath, 
      defaultIgnorePatterns.join('\n'), 
      'utf-8'
    );

    logger.info(`Created ignore file at ${ignorePath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to create ignore file: ${error}`);
    throw error;
  }
}

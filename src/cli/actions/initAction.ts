import fs from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import pc from 'picocolors';
import {
  type repofmOutputStyle,
  defaultConfig,
  defaultFilePathMap,
} from '../../config/configSchema.js';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';
import type { Config, OutputConfig } from '../../types/config.js';

const onCancelOperation = () => {
  prompts.cancel('Initialization cancelled.');
  process.exit(0);
};

export const runInitAction = async (rootDir: string = process.cwd(), isGlobal = false): Promise<void> => {
  try {
    const targetDir = isGlobal ? await getGlobalDirectory() : rootDir;

    prompts.intro(pc.bold(`Welcome to repofm ${isGlobal ? 'Global ' : ''}Configuration!`));

    // 确认是否继续
    const shouldContinue = await prompts.confirm({
      message: `Initialize repofm in ${pc.cyan(targetDir)}?`,
      initialValue: true,
    });

    if (!shouldContinue) {
      prompts.cancel('Initialization cancelled.');
      return;
    }

    // 创建配置文件
    await createConfigFile(targetDir, isGlobal);

    // 创建忽略文件
    await createIgnoreFile(targetDir, isGlobal);

    prompts.outro(pc.green('Initialization completed successfully!'));
  } catch (error) {
    logger.error('Error during initialization:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function createConfigFile(rootDir: string, isGlobal: boolean): Promise<boolean> {
  const configPath = isGlobal
    ? path.resolve(await getGlobalDirectory(), 'repofm.config.json')
    : path.resolve(rootDir, 'repofm.config.json');

  const isCreateConfig = await prompts.confirm({
    message: `Do you want to create a ${isGlobal ? 'global ' : ''}${pc.green('repofm.config.json')} file?`,
  });
  if (!isCreateConfig) {
    prompts.log.info(`Skipping ${pc.green('repofm.config.json')} file creation.`);
    return false;
  }
  if (prompts.isCancel(isCreateConfig)) {
    onCancelOperation();
    return false;
  }

  let isConfigFileExists = false;
  try {
    await fs.access(configPath);
    isConfigFileExists = true;
  } catch {
    // File doesn't exist, so we can proceed
  }

  if (isConfigFileExists) {
    const isOverwrite = await prompts.confirm({
      message: `A ${isGlobal ? 'global ' : ''}${pc.green('repofm.config.json')} file already exists. Do you want to overwrite it?`,
    });
    if (!isOverwrite) {
      prompts.log.info(`Skipping ${pc.green('repofm.config.json')} file creation.`);
      return false;
    }
    if (prompts.isCancel(isOverwrite)) {
      onCancelOperation();
      return false;
    }
  }

  const options = await prompts.group(
    {
      outputStyle: () => {
        return prompts.select({
          message: 'Output style:',
          options: [
            { value: 'plain', label: 'Plain', hint: 'Simple text format' },
            { value: 'xml', label: 'XML', hint: 'Structured XML format' },
            { value: 'markdown', label: 'Markdown', hint: 'Markdown format' },
          ],
          initialValue: defaultConfig.output.style,
        });
      },
      outputFilePath: ({ results }) => {
        const defaultFilePath = defaultFilePathMap[results.outputStyle as repofmOutputStyle];
        return prompts.text({
          message: 'Output file path:',
          initialValue: defaultFilePath,
          validate: (value) => (value.length === 0 ? 'Output file path is required' : undefined),
        });
      },
    },
    {
      onCancel: onCancelOperation,
    },
  );

  const outputConfig: OutputConfig = {
    filePath: options.outputFilePath as string,
    style: options.outputStyle as 'plain' | 'xml' | 'markdown',
    removeComments: false,
    removeEmptyLines: false,
    topFilesLength: 10,
    showLineNumbers: true,
    copyToClipboard: false,
    headerText: 'Default Header',
    instructionFilePath: 'instructions.txt'
  };

  const config: Config = {
    ...defaultConfig,
    output: outputConfig,
    cwd: rootDir,
    ignore: {
      useDefaultPatterns: true,
      useGitignore: true,
      customPatterns: [],
      excludePatterns: []
    }
  };

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  const relativeConfigPath = path.relative(rootDir, configPath);

  prompts.log.success(
    pc.green(`${isGlobal ? 'Global config' : 'Config'} file created!\n`) + pc.dim(`Path: ${relativeConfigPath}`),
  );

  return true;
}

export async function createIgnoreFile(rootDir: string, isGlobal: boolean): Promise<boolean> {
  if (isGlobal) {
    prompts.log.info(`Skipping ${pc.green('.repofmignore')} file creation for global configuration.`);
    return false;
  }

  const ignorePath = path.resolve(rootDir, '.repofmignore');
  const createIgnore = await prompts.confirm({
    message: `Do you want to create a ${pc.green('.repofmignore')} file?`,
  });
  if (!createIgnore) {
    prompts.log.info(`Skipping ${pc.green('.repofmignore')} file creation.`);
    return false;
  }
  if (prompts.isCancel(createIgnore)) {
    onCancelOperation();
    return false;
  }

  let isIgnoreFileExists = false;
  try {
    await fs.access(ignorePath);
    isIgnoreFileExists = true;
  } catch {
    // File doesn't exist, so we can proceed
  }

  if (isIgnoreFileExists) {
    const overwrite = await prompts.confirm({
      message: `A ${pc.green('.repofmignore')} file already exists. Do you want to overwrite it?`,
    });

    if (!overwrite) {
      prompts.log.info(`${pc.green('.repofmignore')} file creation skipped. Existing file will not be modified.`);
      return false;
    }
  }

  const defaultIgnoreContent = `# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
`;

  await fs.writeFile(ignorePath, defaultIgnoreContent);
  prompts.log.success(
    pc.green('Created .repofmignore file!\n') + pc.dim(`Path: ${path.relative(rootDir, ignorePath)}`),
  );

  return true;
}

export async function runInitActionNew(directory: string = process.cwd(), useGlobal: boolean = false): Promise<void> {
  try {
    const configPath = useGlobal 
      ? path.join(process.env.HOME || process.env.USERPROFILE || '', '.repofm.json')
      : path.join(directory, '.repofm.json');

    const config: Config = {
      ...defaultConfig,
      output: {
        ...defaultConfig.output,
        filePath: path.join(directory, 'output.md'),
        headerText: 'Repository Content',
        instructionFilePath: path.join(directory, 'instructions.md')
      },
      ignore: {
        ...defaultConfig.ignore,
        excludePatterns: ['node_modules/**', '.git/**', '*.log']
      }
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    logger.success(`Configuration file created at: ${configPath}`);
  } catch (error) {
    logger.error('Error creating configuration file:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

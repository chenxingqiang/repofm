import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';

export const runInitAction = async (rootDir: string = process.cwd(), isGlobal = false): Promise<void> => {
  try {
    logger.info(`Initializing repofm in ${rootDir}`);
    await createConfigFile(rootDir, isGlobal);
    await createIgnoreFile(rootDir, isGlobal);
    logger.info('Initialization completed successfully!');
  } catch (error) {
    logger.error('Error during initialization:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export async function createConfigFile(rootDir: string, isGlobal: boolean): Promise<boolean> {
  try {
    let configPath: string;
    if (isGlobal) {
      const globalDir = await getGlobalDirectory();
      configPath = path.resolve(globalDir, 'repofm.config.json');
      await fs.mkdir(path.dirname(configPath), { recursive: true });
    } else {
      configPath = path.resolve(rootDir, 'repofm.config.json');
    }

    // Check if file already exists
    let fileExists = false;
    try {
      await fs.access(configPath);
      fileExists = true;
    } catch {
      // File doesn't exist, continue
    }

    if (fileExists) {
      const shouldOverwrite = await prompts.confirm({ message: `Config file already exists at ${configPath}. Overwrite?` });
      if (!shouldOverwrite) {
        return false;
      }
    }

    // Get user config via prompts
    let userConfig: Record<string, unknown>;
    try {
      userConfig = await prompts.group({
        outputFilePath: () => prompts.text({ message: 'Output file path', initialValue: 'repofm-output.txt' }),
        outputStyle: () => prompts.select({ message: 'Output style', options: [
          { value: 'xml', label: 'XML' },
          { value: 'markdown', label: 'Markdown' },
          { value: 'plain', label: 'Plain text' },
        ] }),
      });
    } catch {
      return false;
    }

    const config = {
      output: {
        filePath: userConfig.outputFilePath,
        style: userConfig.outputStyle,
      },
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    logger.info(`Created configuration file at ${configPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to create configuration file: ${error}`);
    return false;
  }
}

export async function createIgnoreFile(rootDir: string, isGlobal: boolean): Promise<boolean> {
  // Global ignore files are not supported
  if (isGlobal) {
    return false;
  }

  const ignorePath = path.resolve(rootDir, '.repofmignore');

  try {
    // Ask user if they want to create the ignore file
    const shouldCreate = await prompts.confirm({ message: 'Create a .repofmignore file?' });
    if (!shouldCreate) {
      return false;
    }

    // Check if file already exists
    let fileExists = false;
    try {
      await fs.access(ignorePath);
      fileExists = true;
    } catch {
      // File doesn't exist, continue
    }

    if (fileExists) {
      const shouldOverwrite = await prompts.confirm({ message: `Ignore file already exists at ${ignorePath}. Overwrite?` });
      if (!shouldOverwrite) {
        return false;
      }
    }

    const defaultIgnoreContent = `# Add patterns to ignore here, one per line
node_modules/
.git/
dist/
lib/
**/*.log
**/*.tmp
`;

    await fs.writeFile(ignorePath, defaultIgnoreContent);
    logger.info(`Created ignore file at ${ignorePath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to create ignore file: ${error}`);
    return false;
  }
}

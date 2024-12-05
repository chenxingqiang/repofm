import { Command } from 'commander';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { logger } from '../shared/logger.js';
import type { CliOptions, Config } from '../types/config.js';
import { CLISpinner } from './cliSpinner.js';
import { createDefaultConfig } from '../config/configLoad.js';

export async function run(): Promise<void> {
  const program = new Command();

  program
    .version('2.0.7')
    .description('Pack your repository into a single AI-friendly file')
    .option('-v, --version', 'Output the current version')
    .option('-g, --global', 'Use global configuration')
    .option('-c, --copy', 'Copy output to clipboard')
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --init', 'Initialize configuration files')
    .option('--security', 'Enable security checks');

  program
    .action(async (options) => {
      const cwd = process.cwd();
      try {
        CLISpinner.start('Processing repository...');
        
        if (options.init) {
          await runInitAction(cwd, options.global);
        } else {
          const defaultConfig = createDefaultConfig(cwd);
          const mergedOptions = {
            ...defaultConfig,
            output: {
              filePath: options.output || defaultConfig.output.filePath,
              style: defaultConfig.output.style,
              removeComments: defaultConfig.output.removeComments,
              removeEmptyLines: defaultConfig.output.removeEmptyLines,
              topFilesLength: defaultConfig.output.topFilesLength,
              showLineNumbers: defaultConfig.output.showLineNumbers,
              copyToClipboard: options.copy ?? defaultConfig.output.copyToClipboard,
              headerText: defaultConfig.output.headerText,
              instructionFilePath: defaultConfig.output.instructionFilePath
            },
            security: {
              enableSecurityCheck: options.security ?? defaultConfig.security.enableSecurityCheck
            }
          };

          await runDefaultAction(cwd, mergedOptions as Partial<CliOptions & Config>);
        }
      } catch (error) {
        logger.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        CLISpinner.cleanup();
      }
    });

  try {
    if (process.env.NODE_ENV !== 'test') {
      program.parse(process.argv);
    } else {
      program.parse(process.argv);
    }
  } catch (error) {
    logger.error('Error running CLI:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

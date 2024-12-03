import { Command } from 'commander';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { logger } from '../shared/logger.js';
import type { CliOptions } from '../types/config.js';
import { CLISpinner } from './cliSpinner.js';

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
    .argument('[directory]', 'Target directory', process.cwd())
    .action(async (directory: string) => {
      const options = program.opts();
      try {
        CLISpinner.start('Processing repository...');
        
        if (options.init) {
          await runInitAction(directory, options.global);
        } else {
          const cliOptions: CliOptions = {
            cwd: directory,
            copy: options.copy,
            output: options.output,
            security: options.security,
            global: options.global
          };
          
          const success = await runDefaultAction(cliOptions);
          if (!success) {
            process.exit(1);
          }
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
      await program.parseAsync(process.argv);
    } else {
      program.opts();
    }
  } catch (error) {
    logger.error('Error running CLI:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

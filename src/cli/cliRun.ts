import { Command } from 'commander';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { runMigrationAction } from './actions/migrationAction.js';
import { runRemoteAction } from './actions/remoteAction.js';
import { runVersionAction } from './actions/versionAction.js';
import { logger } from '../shared/logger.js';

export interface CliOptions {
  output?: string;
  copy?: boolean;
  verbose?: boolean;
  global?: boolean;
  // Add other CLI options as needed
}

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name('repofm')
    .description('A CLI tool for managing repository file structures')
    .version('1.0.0', '-v, --version', 'Output the current version')
    .option('-g, --global', 'Use global configuration')
    .option('-c, --copy', 'Copy output to clipboard')
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --init', 'Initialize configuration files')
    .option('-m, --migrate', 'Migrate configuration files')
    .option('-r, --remote <url>', 'Remote repository URL')
    .option('--verbose', 'Enable verbose logging')
    .option('--config <path>', 'Custom config file path');

  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ repofm');
    console.log('  $ repofm --init');
    console.log('  $ repofm --global');
    console.log('  $ repofm --output tree.txt');
  });

  program.action(async (options, command) => {
    try {
      const targetDir = command.args[0] || '.';

      if (options.verbose) {
        logger.setLevel('debug');
      }

      if (options.version) {
        await runVersionAction();
        return;
      }

      if (options.init) {
        await runInitAction(targetDir, options.global || false);
        return;
      }

      if (options.migrate) {
        await runMigrationAction(targetDir);
        return;
      }

      if (options.remote) {
        await runRemoteAction(options.remote, targetDir);
        return;
      }

      await runDefaultAction(
        targetDir,
        options.config || '',
        {
          copyToClipboard: options.copy || false,
          outputPath: options.output,
          verbose: options.verbose || false,
          global: options.global || false
        }
      );
    } catch (error) {
      logger.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

  await program.parseAsync(process.argv);
}

import { Command } from 'commander';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { logger } from '../shared/logger.js';
import type { CliOptions, Config } from '../types/config.js';
import { CLISpinner } from './cliSpinner.js';
import { createDefaultConfig } from '../config/configLoad.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { searchFiles } from '../core/fileSearch.js';
import { PACKAGE_VERSION } from '../version';

// Default ignored directories for list command
const DEFAULT_LIST_IGNORE = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'lib/**',
  'coverage/**',
  '**/*.d.ts',
  '**/*.map'
];

export async function run(): Promise<void> {
  const program = new Command();

  program.version(PACKAGE_VERSION);

  // Add list command
  program
    .command('list')
    .description('List all tracked files')
    .option('-a, --all', 'Show all files including generated files')
    .action(async (options) => {
      try {
        const cwd = process.cwd();
        const config = createDefaultConfig(cwd);
        config.include = ['**/*']; // Include all files by default for listing
        
        // Add default ignore patterns unless --all flag is used
        if (!options.all) {
          config.ignore.excludePatterns = [
            ...config.ignore.excludePatterns,
            ...DEFAULT_LIST_IGNORE
          ];
        }

        const files = await searchFiles(cwd, config);
        if (files.length === 0) {
          console.log('No tracked files found');
        } else {
          console.log('Tracked files:');
          const sortedFiles = files.sort();
          for (const file of sortedFiles) {
            console.log(`  ${path.relative(cwd, file)}`);
          }
          console.log(`\nTotal: ${files.length} files`);
        }
      } catch (err) {
        console.error('Error listing files:', err);
      }
    });

  // Add status command
  program
    .command('status')
    .description('Show current configuration')
    .action(async () => {
      try {
        const cwd = process.cwd();
        const config = createDefaultConfig(cwd);
        console.log('Current configuration:');
        console.log(JSON.stringify(config, null, 2));
      } catch (err) {
        console.error('Error showing status:', err);
      }
    });

  // Add exclude command
  program
    .command('exclude <pattern>')
    .description('Add a pattern to ignore')
    .action(async (pattern) => {
      try {
        const cwd = process.cwd();
        const configPath = path.join(cwd, '.repofmignore');
        
        // Check if pattern already exists
        let content = '';
        try {
          content = await fs.readFile(configPath, 'utf8');
        } catch (err) {
          // File doesn't exist yet, that's fine
        }

        const patterns = content.split('\n').filter(p => p.trim());
        if (patterns.includes(pattern)) {
          console.log(`Pattern "${pattern}" already exists in .repofmignore`);
          return;
        }

        // Add new pattern
        await fs.appendFile(configPath, patterns.length > 0 ? `\n${pattern}` : pattern);
        console.log(`Added pattern "${pattern}" to .repofmignore`);
      } catch (err) {
        console.error('Failed to add pattern:', err);
      }
    });

  // Add clean command
  program
    .command('clean')
    .description('Remove generated files')
    .action(async () => {
      try {
        const cwd = process.cwd();
        const config = createDefaultConfig(cwd);
        const outputPath = config.output.filePath;

        try {
          await fs.access(outputPath);
          await fs.unlink(outputPath);
          console.log(`Removed generated file: ${outputPath}`);
        } catch (err) {
          if ((err as { code?: string }).code === 'ENOENT') {
            console.log('No generated files to clean');
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error('Failed to clean:', err);
      }
    });

  // Default command
  program
    .option('-g, --global', 'Use global configuration')
    .option('-c, --copy', 'Copy output to clipboard')
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --init', 'Initialize configuration files')
    .option('--security', 'Enable security checks')
    .option('--verbose', 'Enable verbose logging')
    .action(async (options) => {
      if (options.verbose) {
        logger.setLevel('debug');
      }

      const cwd = process.cwd();
      try {
        if (options.init) {
          await runInitAction(cwd, options.global);
        } else {
          await runDefaultAction(cwd, options as CliOptions);
        }
      } catch (err) {
        logger.error('Error:', err);
        process.exit(1);
      }
    });

  try {
    await program.parseAsync();
  } catch (err) {
    logger.error('Error:', err);
    process.exit(1);
  }
}

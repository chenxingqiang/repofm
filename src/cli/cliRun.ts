import { Command } from 'commander';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { runMigrationAction } from './actions/migrationAction.js';
import { runRemoteAction } from './actions/remoteAction.js';
import { runVersionAction } from './actions/versionAction.js';
import { runFindAction } from './actions/findAction.js';
import { runAutocommitAction } from './actions/autocommitAction.js'; // Import the new action
import { logger } from '../shared/logger.js';
import {
  throwIfError,
  validateContextDepth,
  validateContextType,
  validateFilePath,
  validateGitUrl,
  validateOutputFormat,
  validateRequired,
  validateTimeRange
} from './validation.js';

export interface CliOptions {
  output?: string;
  copy?: boolean;
  verbose?: boolean;
  global?: boolean;
  target?: string;
  type?: string;
  depth?: string;
  format?: string;
  range?: string;
}

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name('repofm')
    .description('Pack your repository into a single AI-friendly file')
    .version('1.0.0', '-v, --version', 'Output the current version')
    .option('-g, --global', 'Use global configuration')
    .option('-c, --copy', 'Copy output to clipboard')
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --init', 'Initialize configuration files')
    .option('-m, --migrate', 'Migrate configuration files')
    .option('-r, --remote <url>', 'Remote repository URL')
    .option('--verbose', 'Enable verbose logging')
    .option('--config <path>', 'Custom config file path');

  // Add context command
  program
    .command('context')
    .description('Get code context')
    .option('-t, --target <target>', 'Target (function name, file path, or character position)')
    .option('-y, --type <type>', 'Context type (function, file, character)')
    .option('-d, --depth <depth>', 'Context depth', '1')
    .option('-f, --format <format>', 'Output format (plain, markdown, xml)', 'markdown')
    .action(async (options) => {
      try {
        // Validate required parameters
        throwIfError(validateRequired(options.target, 'Target'));
        throwIfError(validateRequired(options.type, 'Type'));
        
        // Validate parameter values
        throwIfError(validateContextType(options.type));
        throwIfError(validateContextDepth(options.depth));
        throwIfError(validateOutputFormat(options.format));
        throwIfError(validateFilePath(options.target));

        // Execute command
        await runDefaultAction(
          '.',
          '',
          {
            target: options.target,
            type: options.type,
            depth: parseInt(options.depth, 10),
            format: options.format
          }
        );
      } catch (error) {
        logger.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Add git-dashboard command
  program
    .command('git-dashboard')
    .description('Show Git activity dashboard')
    .option('-r, --range <range>', 'Time range (e.g., 7d, 30d)', '7d')
    .action(async (options) => {
      try {
        // Validate time range
        throwIfError(validateTimeRange(options.range));

        // Execute command
        await runDefaultAction('.', '', {
          range: options.range
        });
      } catch (error) {
        logger.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Add migrate-repo command
  program
    .command('migrate-repo')
    .description('Search and migrate repositories from a GitHub user')
    .requiredOption('-u, --user <username>', 'Source GitHub username')
    .requiredOption('-n, --name <name>', 'New repository name')
    .requiredOption('-o, --owner <owner>', 'Target owner/organization')
    .option('-c, --clone', 'Clone repository locally')
    .action(async (options) => {
      try {
        // Validate GitHub username format
        throwIfError(validateRequired(options.user, 'GitHub username'));
        throwIfError(validateRequired(options.name, 'Repository name'));
        throwIfError(validateRequired(options.owner, 'Target owner'));

        // Execute command
        await runMigrationAction('.');
      } catch (error) {
        logger.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Add find command
  program
    .command('find')
    .description('Find files and directories')
    .option('-p, --pattern <pattern>', 'Search pattern (e.g., "*.js", "src/**/*.ts")', '*')
    .option('-t, --type <type>', 'Type filter (file, directory, both)', 'both')
    .option('-d, --max-depth <depth>', 'Maximum depth to search', '-1')
    .option('-f, --format <format>', 'Output format (plain, json)', 'plain')
    .option('-i, --ignore-case', 'Case insensitive search', false)
    .option('-e, --exclude <patterns...>', 'Patterns to exclude')
    .action(async (options) => {
      try {
        // Validate type
        if (!['file', 'directory', 'both'].includes(options.type)) {
          throw new Error('Type must be one of: file, directory, both');
        }

        // Validate format
        if (!['plain', 'json'].includes(options.format)) {
          throw new Error('Format must be one of: plain, json');
        }

        // Validate depth
        const maxDepth = parseInt(options.maxDepth, 10);
        if (isNaN(maxDepth)) {
          throw new Error('Max depth must be a number');
        }

        await runFindAction('.', {
          pattern: options.pattern,
          type: options.type,
          maxDepth,
          format: options.format,
          ignoreCase: options.ignoreCase,
          excludePatterns: options.exclude || []
        });
      } catch (error) {
        logger.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Add autocommit command
  program
    .command('autocommit')
    .description('Automatically commit changes with smart commit messages')
    .option('-m, --message <message>', 'Custom commit message')
    .option('-p, --pattern <pattern>', 'File pattern to stage (e.g., "*.ts", "src/**/*")')
    .option('-P, --push', 'Push changes after commit')
    .option('-b, --branch <branch>', 'Branch to push to (default: current branch)')
    .option('-r, --remote <remote>', 'Remote to push to (default: origin)')
    .option('-a, --all', 'Stage all changes')
    .option('-i, --interactive', 'Interactive mode - confirm before each action')
    .action(async (options) => {
      try {
        await runAutocommitAction('.', {
          message: options.message,
          pattern: options.pattern,
          push: options.push,
          branch: options.branch,
          remote: options.remote,
          all: options.all,
          interactive: options.interactive
        });
      } catch (error) {
        logger.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ repofm');
    console.log('  $ repofm --init');
    console.log('  $ repofm --global');
    console.log('  $ repofm --output tree.txt');
    console.log('  $ repofm find --pattern "*.ts" --type file');
    console.log('  $ repofm find --max-depth 2 --format json');
    console.log('  $ repofm autocommit --all --push');
    console.log('  $ repofm autocommit --pattern "src/**/*.ts" --message "feat: update typescript files"');
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
        // Validate remote URL
        throwIfError(validateGitUrl(options.remote));
        await runRemoteAction(options.remote, targetDir);
        return;
      }

      // Validate output path if provided
      if (options.output) {
        throwIfError(validateFilePath(options.output));
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

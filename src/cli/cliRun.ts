import { Command } from 'commander';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../shared/logger.js';
import { searchFiles, findFiles, SearchOptions } from '../core/file/fileSearch.js';
import { parsePackageJson } from '../core/file/packageJsonParse.js';
import { exists } from '../core/file/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run(argv: string[] = process.argv): Promise<void> {
  const program = new Command();

  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = await parsePackageJson(packageJsonPath);
    
    program
      .name('repofm')
      .description('Repository File Manager - A CLI tool for managing repository files')
      .version(packageJson.version);

    program
      .command('search')
      .description('Search for files in the repository')
      .argument('<pattern>', 'Search pattern')
      .option('-p, --path <path>', 'Search path', process.cwd())
      .option('-c, --case-sensitive', 'Enable case-sensitive search', false)
      .option('-d, --dot-files', 'Include dot files in search', false)
      .option('-m, --max-depth <depth>', 'Maximum depth to search', undefined)
      .option('-e, --exclude <patterns...>', 'Patterns to exclude')
      .option('-i, --include <patterns...>', 'Patterns to include')
      .action(async (pattern, options) => {
        try {
          const searchPath = path.resolve(options.path);
          
          if (!(await exists(searchPath))) {
            throw new Error(`Search path does not exist: ${searchPath}`);
          }

          const searchOptions: SearchOptions = {
            dot: options.dotFiles,
            ignore: options.exclude ? { patterns: options.exclude } : undefined
          };

          const results = await searchFiles(searchPath, pattern, searchOptions);
          
          if (results.length === 0) {
            console.log('No matches found.');
            return;
          }

          for (const result of results) {
            console.log(`\nFile: ${result.path}`);
            if (result.matches) {
              for (const match of result.matches) {
                console.log(`  Line ${match.line}: ${match.content}`);
              }
            }
          }
        } catch (error) {
          logger.error('Search command failed:', error);
          throw error;
        }
      });

    program
      .command('find')
      .description('Find files by pattern')
      .argument('<patterns...>', 'File patterns to find')
      .option('-p, --path <path>', 'Search path', process.cwd())
      .option('-d, --dot-files', 'Include dot files in search', false)
      .option('-m, --max-depth <depth>', 'Maximum depth to search')
      .option('-e, --exclude <patterns...>', 'Patterns to exclude')
      .action(async (patterns, options) => {
        try {
          const searchPath = path.resolve(options.path);
          
          if (!(await exists(searchPath))) {
            throw new Error(`Search path does not exist: ${searchPath}`);
          }

          const searchOptions: SearchOptions = {
            dot: options.dotFiles,
            ignore: options.exclude ? { patterns: options.exclude } : undefined
          };

          const files = await findFiles(searchPath, patterns, searchOptions);
          
          if (files.length === 0) {
            console.log('No files found.');
            return;
          }

          console.log('Found files:');
          for (const file of files) {
            console.log(`  ${file}`);
          }
        } catch (error) {
          logger.error('Find command failed:', error);
          throw error;
        }
      });

    await program.parseAsync(argv);
  } catch (error) {
    logger.error('Unhandled error:', error);
    
    // In test environment, rethrow the error
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    
    // In non-test environment, exit with error code
    process.exit(1);
  }
}

// Run CLI if this file is being executed directly
if (import.meta.url === `file://${__filename}`) {
  run().catch(error => {
    logger.error('Unhandled error:', error);
    if (process.env.NODE_ENV === 'test') {
      // Ensure the error is propagated in test environment
      return Promise.reject(error);
    } else {
      process.exit(1);
    }
  });
}

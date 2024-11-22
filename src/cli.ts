#!/usr/bin/env node

import { Command } from 'commander';
import { run } from './cli/cliRun.js';
import { RepoMigrationService } from './services/RepoMigrationService.js';
import { GitHistoryTracker } from './services/GitHistoryTracker.js';
import { CodeContextManager } from './services/CodeContextManager.js';
import { formatDashboard } from './utils/formatDashboard.js';
import { loadConfig } from './config/index.js';
import { argv, exit } from 'node:process';

export default async function main() {
  const program = new Command();
  const config = loadConfig();

  program
    .name('repofm')
    .description('Pack your repository into a single AI-friendly file')
    .version('0.1.0');

  program
    .command('migrate-repo')
    .description('Search and migrate repositories from a GitHub user')
    .option('-u, --user <username>', 'Source GitHub username')
    .option('-n, --name <name>', 'New repository name')
    .option('-o, --owner <owner>', 'Target owner/organization')
    .option('-c, --clone', 'Clone repository locally')
    .action(async (options) => {
      const service = new RepoMigrationService(config);
      await service.migrateRepository(options);
    });

  program
    .command('git-dashboard')
    .description('Show Git activity dashboard')
    .option('-r, --range <range>', 'Time range (e.g., 7d, 30d)', '7d')
    .action(async (options) => {
      const tracker = new GitHistoryTracker(config);
      const data = await tracker.getDashboardData(options.range);
      console.log(formatDashboard(data));
    });

  program
    .command('context')
    .description('Get code context')
    .option('-t, --target <target>', 'Target (function name, file path, or character position)')
    .option('-y, --type <type>', 'Context type (function, file, character)')
    .option('-d, --depth <depth>', 'Context depth', '1')
    .option('-f, --format <format>', 'Output format (plain, markdown, xml)', 'markdown')
    .action(async (options) => {
      const manager = new CodeContextManager({ outputFormat: options.format });
      const context = await manager.getContext(options);
      console.log(context);
    });

  await program.parseAsync(argv);
}

// 如果直接运行此文件
if (import.meta.url === `file://${argv[1]}`) {
  main().catch(err => {
    console.error('Error:', err);
    exit(1);
  });
}

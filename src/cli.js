// src/cli.js
program
    .command('migrate-repo')
    .description('Search and migrate repositories from a GitHub user')
    .option('-u, --user <username>', 'Source GitHub username')
    .option('-n, --name <name>', 'New repository name')
    .option('-o, --owner <owner>', 'Target owner/organization')
    .option('-c, --clone', 'Clone repository locally')
    .action(async (options) => {
        const service = new RepoMigrationService(config)
        await service.migrateRepository(options)
    })

program
    .command('git-dashboard')
    .description('Show Git activity dashboard')
    .option('-r, --range <range>', 'Time range (e.g., 7d, 30d)', '7d')
    .action(async (options) => {
        const tracker = new GitHistoryTracker(config)
        const data = await tracker.getDashboardData(options.range)
        console.log(formatDashboard(data))
    })

program
    .command('context')
    .description('Get code context')
    .option('-t, --target <target>', 'Target (function name, file path, or character position)')
    .option('-y, --type <type>', 'Context type (function, file, character)')
    .option('-d, --depth <depth>', 'Context depth', '1')
    .option('-f, --format <format>', 'Output format (plain, markdown, xml)', 'markdown')
    .action(async (options) => {
        const manager = new CodeContextManager({ outputFormat: options.format })
        const context = await manager.getContext(options)
        console.log(context)
    })

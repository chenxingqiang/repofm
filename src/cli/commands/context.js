// src/cli/commands/context.js
import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { CodeContextManager } from '../../features/contextManager'
import { loadConfig } from '../config'
import { resolveFilePath, validatePath } from '../utils'

export function registerContextCommands(program) {
    const contextCommand = new Command('context').description('Manage and extract code context information')

    // Command to extract context
    contextCommand
        .command('extract')
        .description('Extract context for a specific code element')
        .option('-t, --target <target>', 'Target element (function name, file path, or character position)')
        .option('-y, --type <type>', 'Context type (function, file, character)', 'function')
        .option('-f, --file <file>', 'Source file path (required for function and character types)')
        .option('-d, --depth <depth>', 'Context analysis depth', '1')
        .option('-o, --output <format>', 'Output format (markdown, xml, plain)', 'markdown')
        .option('-s, --save <path>', 'Save output to file')
        .option('--include-imports', 'Include import statements', true)
        .option('--include-exports', 'Include export statements', true)
        .option('--max-lines <lines>', 'Maximum context lines', '100')
        .action(async (options) => {
            const spinner = ora('Extracting code context...').start()
            try {
                const config = await loadConfig()
                const manager = new CodeContextManager({
                    ...config.context,
                    outputFormat: options.output,
                    maxDepth: parseInt(options.depth),
                    includeImports: options.includeImports,
                    includeExports: options.includeExports,
                    maxContextLines: parseInt(options.maxLines)
                })

                // Validate inputs
                if (!options.target) {
                    throw new Error('Target is required')
                }

                if (['function', 'character'].includes(options.type) && !options.file) {
                    throw new Error('File path is required for function and character context types')
                }

                // Resolve file path if provided
                const filePath = options.file ? resolveFilePath(options.file) : null
                if (filePath) {
                    await validatePath(filePath)
                }

                // Extract context
                const context = await manager.getContext({
                    target: options.target,
                    type: options.type,
                    depth: parseInt(options.depth),
                    file: filePath
                })

                // Handle output
                if (options.save) {
                    const outputPath = resolveFilePath(options.save)
                    await fs.writeFile(outputPath, context)
                    spinner.succeed(`Context saved to ${chalk.green(outputPath)}`)
                } else {
                    spinner.stop()
                    console.log(context)
                }
            } catch (error) {
                spinner.fail(chalk.red(`Failed to extract context: ${error.message}`))
                process.exit(1)
            }
        })
    // Add global options for gitignore support
    contextCommand
        .option('--respect-gitignore <boolean>', 'Respect .gitignore rules', true)
        .option('--custom-ignore <patterns...>', 'Additional ignore patterns')
        .hook('preAction', async (thisCommand) => {
            const options = thisCommand.opts()
            const config = await loadConfig()

            // Update config with gitignore options
            config.context = {
                ...config.context,
                respectGitIgnore: options.respectGitignore !== 'false',
                customIgnores: options.customIgnore || []
            }

            // Initialize GitIgnoreHandler
            const manager = new CodeContextManager(config.context)
            await manager.initialize()
        })

    // Command to search within contexts
    contextCommand
        .command('search')
        .description('Search within extracted contexts')
        .option('-q, --query <query>', 'Search query')
        .option('-p, --path <path>', 'Path to search in')
        .option('-t, --type <type>', 'Limit search to context type (function, file, character)')
        .option('--json', 'Output results as JSON')
        .action(async (options) => {
            const spinner = ora('Searching contexts...').start()
            try {
                const config = await loadConfig()
                const manager = new CodeContextManager(config.context)

                const results = await manager.searchContext({
                    query: options.query,
                    path: options.path,
                    type: options.type
                })

                spinner.stop()
                if (options.json) {
                    console.log(JSON.stringify(results, null, 2))
                } else {
                    console.log(formatSearchResults(results))
                }
            } catch (error) {
                spinner.fail(chalk.red(`Search failed: ${error.message}`))
                process.exit(1)
            }
        })

    // Command to manage context cache
    contextCommand
        .command('cache')
        .description('Manage context cache')
        .option('--clear', 'Clear context cache')
        .option('--list', 'List cached contexts')
        .option('--rebuild', 'Rebuild context cache')
        .action(async (options) => {
            const spinner = ora('Managing context cache...').start()
            try {
                const config = await loadConfig()
                const manager = new CodeContextManager(config.context)

                if (options.clear) {
                    await manager.clearCache()
                    spinner.succeed('Context cache cleared')
                } else if (options.list) {
                    const cached = await manager.listCachedContexts()
                    spinner.stop()
                    console.log(formatCacheList(cached))
                } else if (options.rebuild) {
                    await manager.rebuildCache()
                    spinner.succeed('Context cache rebuilt')
                }
            } catch (error) {
                spinner.fail(chalk.red(`Cache operation failed: ${error.message}`))
                process.exit(1)
            }
        })

    return contextCommand
}

// Helper functions for formatting output
function formatSearchResults(results) {
    let output = chalk.bold('\nSearch Results:\n')

    results.forEach((result, index) => {
        output += `\n${chalk.cyan(`[${index + 1}] ${result.type}: ${result.target}`)}\n`
        output += `${chalk.gray('File:')} ${result.file}\n`
        output += `${chalk.gray('Match:')} ${highlightMatch(result.match)}\n`
        if (result.context) {
            output += `${chalk.gray('Context:')}\n${indent(result.context)}\n`
        }
    })

    return output
}

function formatCacheList(cached) {
    let output = chalk.bold('\nCached Contexts:\n')

    Object.entries(cached).forEach(([type, items]) => {
        output += `\n${chalk.cyan(type)}:\n`
        items.forEach((item) => {
            output += `  - ${item.target} (${chalk.gray(item.file)})\n`
        })
    })

    return output
}

function indent(text, spaces = 2) {
    return text
        .split('\n')
        .map((line) => ' '.repeat(spaces) + line)
        .join('\n')
}

function highlightMatch(text) {
    // Implementation of text highlighting
    return text
}

import { Command } from 'commander';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { runAutocommitAction } from './actions/autocommitAction.js';
import { logger } from '../shared/logger.js';
import { createDefaultConfig } from '../config/configLoad.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { searchFiles } from '../core/fileSearch.js';
import { PACKAGE_VERSION } from '../version.js';
import { configureAIProviders, listAIProviders } from './actions/aiProviderAction.js';
import { exploreModelCapabilities, searchModelCapabilities } from './actions/modelCapabilityAction.js';
import { ollamaInteract } from './actions/ollamaAction.js';
import * as readline from 'readline';
import { ModelProviderFactory } from '../core/modelProviderFactory.js';
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
export async function run() {
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
            }
            else {
                console.log('Tracked files:');
                const sortedFiles = files.sort();
                for (const file of sortedFiles) {
                    console.log(`  ${path.relative(cwd, file)}`);
                }
                console.log(`\nTotal: ${files.length} files`);
            }
        }
        catch (err) {
            console.error('Error listing files:', err);
        }
    });
    // Add autocommit command
    program
        .command('autocommit')
        .description('Automatically commit changes in the repository')
        .option('-m, --message <message>', 'Custom commit message')
        .option('-p, --pattern <patterns...>', 'Stage files matching patterns (can be multiple)')
        .option('--exclude <excludePatterns...>', 'Exclude files matching these patterns')
        .option('--push', 'Push changes to remote after commit')
        .option('-a, --all', 'Stage all changes')
        .option('--branch <branch>', 'Specify branch to push to')
        .option('--remote <remote>', 'Specify remote repository')
        .option('--case-sensitive', 'Perform case-sensitive pattern matching')
        .option('--include-dot-files', 'Include dot files in matching')
        .option('--debug', 'Enable debug logging for pattern matching')
        .option('--ai-commit', 'Generate commit message using AI')
        .option('--max-commit-length <length>', 'Maximum length for AI-generated commit message', '72')
        .action(async (options) => {
        try {
            const cwd = process.cwd();
            await runAutocommitAction(cwd, {
                message: options.message,
                patterns: options.pattern,
                excludePatterns: options.exclude,
                push: options.push,
                branch: options.branch,
                remote: options.remote,
                all: options.all,
                ignoreCase: !options.caseSensitive,
                includeDotFiles: options.includeDotFiles,
                debug: options.debug,
                aiCommitMessage: options.aiCommit,
                maxCommitLength: options.maxCommitLength
                    ? parseInt(options.maxCommitLength, 10)
                    : 72
            });
        }
        catch (err) {
            console.error('Error running autocommit:', err);
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
        }
        catch (err) {
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
            }
            catch (err) {
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
        }
        catch (err) {
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
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    console.log('No generated files to clean');
                }
                else {
                    throw err;
                }
            }
        }
        catch (err) {
            console.error('Failed to clean:', err);
        }
    });
    // AI Provider Commands
    program
        .command('ai')
        .description('AI provider management commands')
        .addCommand(new Command('config')
        .description('Configure AI providers')
        .action(configureAIProviders))
        .addCommand(new Command('list')
        .description('List configured AI providers')
        .action(listAIProviders))
        .addCommand(new Command('remove')
        .description('Remove an AI provider configuration')
        .action(removeAIProvider))
        .addCommand(new Command('test')
        .description('Test the configured AI provider')
        .action(testAIProvider));
    // Add model capability exploration commands
    program
        .command('model-explore')
        .description('Explore and compare AI model capabilities')
        .action(exploreModelCapabilities)
        .command('model-search')
        .description('Search for models by specific capabilities')
        .action(searchModelCapabilities);
    // Add Ollama interaction command
    program
        .command('ollama')
        .description('Interact with local Ollama AI models')
        .action(ollamaInteract);
    // Add chatWithCode command
    program
        .command('chat-with-code')
        .description('Interactive chat using Ollama')
        .option('-p, --provider <provider>', 'Specify AI provider (default: ollama)')
        .option('-m, --model <model>', 'Specify Ollama model to use')
        .option('-t, --temperature <temperature>', 'Set temperature for responses (0-2)')
        .option('--max-tokens <maxTokens>', 'Set maximum tokens for responses')
        .option('--list-models', 'List available Ollama models')
        .action(async (options) => {
        if (options.listModels) {
            const ollamaService = new OllamaInteractionService();
            const models = await ollamaService.getAvailableModels();
            console.log('Available Ollama models:');
            models.forEach(model => console.log(`- ${model}`));
            return;
        }
        await chatWithCode(options);
    });
    program
        .command('ai-commit')
        .description('Generate commit message using AI')
        .option('-p, --provider <provider>', 'Specify AI provider (default: ollama)')
        .option('-m, --model <model>', 'Specify Ollama model to use')
        .option('-t, --temperature <temperature>', 'Set temperature (0-2)')
        .option('--staged', 'Only include staged changes')
        .action(async (options) => {
        try {
            const provider = options.provider || 'ollama';
            const aiProvider = await ModelProviderFactory.createProvider(provider);
            if (!aiProvider) {
                console.error('Failed to initialize AI provider');
                return;
            }
            // Configure Ollama if needed
            if (provider === 'ollama' && aiProvider instanceof OllamaProvider) {
                if (options.model) {
                    await aiProvider.setModel(options.model);
                }
                if (options.temperature) {
                    aiProvider.updateConfig({ temperature: parseFloat(options.temperature) });
                }
            }
            // Get git diff
            const diff = options.staged ?
                await execAsync('git diff --staged') :
                await execAsync('git diff');
            if (!diff) {
                console.log('No changes to commit');
                return;
            }
            console.log('Generating commit message...');
            const message = await aiProvider.generateCommitMessage(diff);
            console.log('\nSuggested commit message:');
            console.log(message);
            // Optionally, ask if user wants to use this message
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const answer = await new Promise(resolve => {
                rl.question('\nUse this message? (y/n) ', resolve);
            });
            if (answer.toLowerCase() === 'y') {
                await execAsync(`git commit -m "${message}"`);
                console.log('Changes committed successfully!');
            }
            rl.close();
        }
        catch (error) {
            console.error('Error generating commit message:', error);
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
            }
            else {
                await runDefaultAction(cwd, options);
            }
        }
        catch (err) {
            logger.error('Error:', err);
            process.exit(1);
        }
    });
    async function chatWithCode(options) {
        try {
            const provider = options.provider || 'ollama';
            const aiProvider = await ModelProviderFactory.createProvider(provider);
            if (!aiProvider) {
                console.error('Failed to initialize AI provider');
                return;
            }
            console.log('Starting chat session...');
            console.log('Type "exit" or press Ctrl+C to end the conversation\n');
            const messages = [];
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            while (true) {
                const userInput = await new Promise((resolve) => {
                    rl.question('You: ', resolve);
                });
                if (userInput.toLowerCase() === 'exit') {
                    break;
                }
                // Add user message to history
                messages.push({
                    role: 'user',
                    content: userInput
                });
                try {
                    // Get AI response
                    const response = await aiProvider.chat(messages);
                    // Add AI response to history
                    messages.push({
                        role: 'assistant',
                        content: response
                    });
                    console.log('\nAssistant:', response, '\n');
                }
                catch (error) {
                    console.error('Error getting response:', error);
                    console.log('Please try again or type "exit" to quit\n');
                }
            }
            rl.close();
            console.log('\nChat session ended');
        }
        catch (error) {
            console.error('Chat error:', error);
        }
    }
    try {
        await program.parseAsync(process.argv);
    }
    catch (err) {
        logger.error('Error:', err);
        process.exit(1);
    }
}

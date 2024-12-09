import * as p from '@clack/prompts.js';
import chalk from 'chalk.js';
import { aiProviderConfig } from '../../config/AIProviderConfig.js';
import { logger } from '../../shared/logger.js';
import { OllamaInteractionService } from '../../services/OllamaInteractionService.js';
export async function configureAIProviders() {
    console.clear();
    p.intro(chalk.bgBlue(' AI Provider Configuration '));
    // Provider selection
    const providerChoice = await p.select({
        message: 'Select AI Provider to configure',
        options: [
            { value: 'ollama', label: 'Ollama (Local)' },
            { value: 'openai', label: 'OpenAI' },
            { value: 'anthropic', label: 'Anthropic' },
            { value: 'google', label: 'Google' },
            { value: 'mistral', label: 'Mistral' },
            { value: 'groq', label: 'Groq' },
            { value: 'bedrock', label: 'Amazon Bedrock' }
        ]
    });
    if (p.isCancel(providerChoice)) {
        p.cancel('Configuration cancelled.');
        return;
    }
    let apiKey = '';
    if (providerChoice === 'ollama') {
        // For Ollama, we'll check if it's running and list available models
        const spinner = p.spinner();
        spinner.start('Checking Ollama status');
        const ollama = new OllamaInteractionService();
        const isRunning = await ollama.isOllamaRunning();
        if (!isRunning) {
            spinner.stop(chalk.red('Ollama is not running'));
            p.note('Please start Ollama first using: ollama serve', 'Error');
            return;
        }
        spinner.stop(chalk.green('Ollama is running'));
        // List available models
        spinner.start('Fetching available models');
        const models = await listAIProviders();
        spinner.stop('Models fetched');
        if (models.length === 0) {
            p.note('No models found. Please pull a model using: ollama pull <model>', 'Warning');
            return;
        }
        p.note(chalk.green('Available models:\n' + models.map(model => model.label).join('\n')), 'Models');
        // Model selection
        const modelChoice = await p.select({
            message: 'Select default model',
            options: models
        });
        if (p.isCancel(modelChoice)) {
            p.cancel('Configuration cancelled.');
            return;
        }
        apiKey = modelChoice.value;
    }
    else {
        // For other providers, request API key
        const apiKeyInput = await p.text({
            message: `Enter API Key for ${providerChoice}`,
            validate(value) {
                if (!value)
                    return 'API Key is required';
            }
        });
        if (p.isCancel(apiKeyInput)) {
            p.cancel('Configuration cancelled.');
            return;
        }
        apiKey = apiKeyInput;
    }
    // Validate credentials
    const spinner = p.spinner();
    spinner.start('Validating configuration');
    try {
        const isValid = await aiProviderConfig.validateCredentials(providerChoice, apiKey);
        if (isValid) {
            // Save credentials
            aiProviderConfig.setProviderCredentials(providerChoice, apiKey);
            spinner.stop(chalk.green('Configuration validated and saved successfully!'));
            // Ask to set as default provider
            const setDefault = await p.confirm({
                message: 'Set this as the default AI provider?'
            });
            if (setDefault) {
                aiProviderConfig.setDefaultProvider(providerChoice);
                p.note(`${providerChoice} is now the default AI provider`, 'Default Provider');
            }
        }
        else {
            spinner.stop(chalk.red('Invalid configuration'));
            p.note('Please check your configuration and try again', 'Validation Failed');
        }
    }
    catch (error) {
        spinner.stop(chalk.red('Configuration failed'));
        logger.error('AI Provider configuration error', error);
        p.note('An unexpected error occurred', 'Error');
    }
    p.outro(chalk.green('AI Provider Configuration Complete'));
}
export async function listAIProviders() {
    const ollamaService = new OllamaInteractionService();
    const models = await ollamaService.listLocalModels();
    return models.map(model => ({
        value: model,
        label: model.name,
        hint: `${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB`
    }));
}
export async function removeAIProvider() {
    const config = aiProviderConfig.loadConfig();
    const providerToRemove = await p.select({
        message: 'Select AI Provider to remove',
        options: Object.keys(config.providers).map(provider => ({
            value: provider,
            label: provider.toUpperCase()
        }))
    });
    if (p.isCancel(providerToRemove)) {
        p.cancel('Removal cancelled.');
        return;
    }
    // Remove provider credentials
    const updatedConfig = {
        ...config,
        providers: {
            ...config.providers
        }
    };
    delete updatedConfig.providers[providerToRemove];
    // If removing default provider, reset it
    if (config.defaultProvider === providerToRemove) {
        const remainingProviders = Object.keys(updatedConfig.providers);
        updatedConfig.defaultProvider = remainingProviders[0] || 'ollama';
    }
    aiProviderConfig.saveConfig(updatedConfig);
    p.outro(chalk.green(`${providerToRemove} provider removed successfully`));
}

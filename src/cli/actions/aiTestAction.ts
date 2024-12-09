import * as p from '@clack/prompts.js';
import chalk from 'chalk.js';
import { OllamaInteractionService } from '../../services/OllamaInteractionService.js';
import { aiProviderConfig } from '../../config/AIProviderConfig.js';
import { logger } from '../../shared/logger.js';

export async function testAIProvider() {
  console.clear();
  p.intro(chalk.bgBlue(' Test AI Provider '));

  // Get configured providers
  const config = aiProviderConfig.loadConfig();
  const provider = config.defaultProvider;

  if (!provider) {
    p.note(chalk.red('No AI provider configured. Please configure one first.'));
    return;
  }

  const spinner = p.spinner();

  if (provider === 'ollama') {
    spinner.start('Testing Ollama connection');
    const ollama = new OllamaInteractionService();
    const isRunning = await ollama.isOllamaRunning();
    
    if (!isRunning) {
      spinner.stop('Failed');
      p.note(chalk.red('Ollama is not running. Please start Ollama first.'));
      return;
    }
    spinner.stop('Connected');

    // List available models
    spinner.start('Fetching available models');
    const models = await ollama.listLocalModels();
    spinner.stop('Models fetched');

    if (models.length === 0) {
      p.note(chalk.red('No models available. Please pull a model using: ollama pull llama2'));
      return;
    }

    p.note(chalk.green('Available models:\n' + models.map(m => m.name).join('\n')), 'Models');

    // Model selection
    const modelChoice = await p.select({
      message: 'Select a model to test',
      options: models.map(model => ({
        value: model,
        label: model.name,
        hint: `${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB`
      }))
    });

    if (p.isCancel(modelChoice)) {
      p.cancel('Operation cancelled');
      return;
    }

    const selectedModel = modelChoice as OllamaModel;
    await ollama.setModel(selectedModel.name);

    // Interactive chat
    p.note(chalk.blue('Starting interactive chat. Type "exit" to end.'));
    await ollama.interactiveChat();
  } else {
    p.note(chalk.red(`Testing ${provider} is not implemented yet.`));
  }

  p.outro(chalk.green('Test completed!'));
}

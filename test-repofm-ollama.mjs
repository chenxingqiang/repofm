import { Command } from 'commander';
import ollama from 'ollama';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { OllamaInteractionService } from './src/services/OllamaInteractionService.js';

async function testRepoFmOllama() {
  console.clear();
  p.intro(chalk.bgBlue(' RepoFM Ollama Integration Test '));

  try {
    const ollamaService = new OllamaInteractionService();
    
    // Step 1: Test Ollama Connection
    console.log('\n1. Testing Ollama Connection...');
    const isRunning = await ollamaService.isOllamaRunning();
    if (!isRunning) {
      console.error(chalk.red('Error: Ollama is not running. Please start Ollama first.'));
      process.exit(1);
    }
    console.log(chalk.green('✓ Ollama is running'));

    // Step 2: List Available Models
    console.log('\n2. Listing Available Models...');
    const models = await ollamaService.listLocalModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(chalk.green(`- ${model.name}`));
    });

    // Step 3: Test Model Selection
    const modelName = 'mistral';
    console.log(`\n3. Testing Model Selection (${modelName})...`);
    await ollamaService.setModel(modelName);
    console.log(chalk.green(`✓ Model ${modelName} selected`));

    // Step 4: Test Chat Generation
    console.log('\n4. Testing Chat Generation...');
    const response = await ollamaService.generateText('Hello! Can you help me test the RepoFM integration?');
    console.log('\nModel Response:');
    console.log(chalk.blue(response));

    // Step 5: Test Interactive Chat
    console.log('\n5. Testing Interactive Chat...');
    console.log('Starting interactive chat (press Ctrl+C to exit):');
    await ollamaService.interactiveChat(modelName);

  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  }
}

// Run the test
testRepoFmOllama();

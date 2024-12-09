import { Command } from 'commander';
import ollama from 'ollama';
import * as p from '@clack/prompts';
import chalk from 'chalk';

async function testOllama() {
  console.clear();
  p.intro(chalk.bgBlue(' Ollama Test '));

  try {
    // Check if Ollama is running
    const spinner = p.spinner();
    spinner.start('Checking Ollama status');
    const response = await ollama.list();
    spinner.stop('Connected to Ollama');

    // Display available models
    const models = response.models.map(m => ({
      label: `${m.name} (${m.details.parameter_size})`,
      value: m.name
    }));

    const modelChoice = await p.select({
      message: 'Select a model to test',
      options: models
    });

    if (p.isCancel(modelChoice)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    // Test chat
    const prompt = await p.text({
      message: 'Enter your message',
      placeholder: 'Hello! How are you?'
    });

    if (p.isCancel(prompt)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    spinner.start('Generating response');
    const chatResponse = await ollama.chat({
      model: modelChoice,
      messages: [{ role: 'user', content: prompt }]
    });
    spinner.stop('Response received');

    console.log('\n' + chalk.blue('Model Response:'));
    console.log(chatResponse.message.content);

  } catch (error) {
    console.error('Error:', error);
    p.cancel('Failed to connect to Ollama');
    process.exit(1);
  }

  p.outro(chalk.green('Test completed successfully!'));
}

// Set up CLI
const program = new Command();

program
  .name('ollama-test')
  .description('Test Ollama integration')
  .action(testOllama);

program.parse();

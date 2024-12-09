import { Command } from 'commander';
import ollama from 'ollama';
import chalk from 'chalk';

async function testOllama(modelName = 'mistral') {
  console.clear();
  console.log(chalk.bgBlue(' Ollama Test '));

  try {
    // Check if Ollama is running
    console.log('Checking Ollama status...');
    const response = await ollama.list();
    console.log('Connected to Ollama');

    // Display available models
    console.log('\nAvailable models:');
    response.models.forEach(m => {
      console.log(chalk.green(`- ${m.name} (${m.details.parameter_size})`));
    });

    // Test chat with specified model
    console.log(`\nTesting chat with ${modelName}...`);
    const chatResponse = await ollama.chat({
      model: modelName,
      messages: [{ role: 'user', content: 'Hello! Can you help me test the Ollama integration?' }]
    });

    console.log('\n' + chalk.blue('Model Response:'));
    console.log(chatResponse.message.content);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log(chalk.green('\nTest completed successfully!'));
}

// Set up CLI
const program = new Command();

program
  .name('ollama-test')
  .description('Test Ollama integration')
  .argument('[model]', 'model to test', 'mistral')
  .action(testOllama);

program.parse();

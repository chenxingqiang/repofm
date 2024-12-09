import ollama from 'ollama';
import chalk from 'chalk';

async function testRepoFmOllama() {
  console.clear();
  console.log(chalk.bgBlue(' RepoFM Ollama Integration Test '));

  try {
    // Step 1: Test Ollama Connection
    console.log('\n1. Testing Ollama Connection...');
    const response = await ollama.list();
    console.log(chalk.green('✓ Ollama is running'));

    // Step 2: List Available Models
    console.log('\n2. Available Models:');
    response.models.forEach(model => {
      console.log(chalk.green(`- ${model.name} (${model.details.parameter_size})`));
    });

    // Step 3: Test Chat with Mistral
    const modelName = 'mistral';
    console.log(`\n3. Testing Chat with ${modelName}...`);
    
    const chatResponse = await ollama.chat({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant for the RepoFM project.' },
        { role: 'user', content: 'Hello! Can you help me test the RepoFM integration?' }
      ]
    });

    console.log('\nModel Response:');
    console.log(chalk.blue(chatResponse.message.content));

    // Step 4: Test Code Generation
    console.log('\n4. Testing Code Generation...');
    const codeResponse = await ollama.chat({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are a helpful AI coding assistant.' },
        { role: 'user', content: 'Write a simple Node.js function to read a file asynchronously.' }
      ]
    });

    console.log('\nCode Generation Response:');
    console.log(chalk.blue(codeResponse.message.content));

  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  }

  console.log(chalk.green('\nTest completed successfully!'));
}

// Run the test
testRepoFmOllama();

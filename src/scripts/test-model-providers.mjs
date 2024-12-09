import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { GroqProvider } from '../ai/ModelProviders.js';
import { logger } from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testGroqProvider() {
  try {
    console.log(chalk.blue('\nTesting GroqProvider...'));
    
    const provider = new GroqProvider();
    
    // Test basic completion
    console.log(chalk.yellow('\nTesting basic completion...'));
    const prompt = 'What is the capital of France?';
    console.log('Prompt:', prompt);
    
    const completion = await provider.complete(prompt);
    console.log('Response:', completion);
    
    // Test chat completion
    console.log(chalk.yellow('\nTesting chat completion...'));
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Tell me about TypeScript.' }
    ];
    
    const chatResponse = await provider.chat(messages);
    console.log('Chat Response:', chatResponse);
    
    // Test code analysis
    console.log(chalk.yellow('\nTesting code analysis...'));
    const code = `
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    `;
    
    const analysis = await provider.analyzeCode(code);
    console.log('Code Analysis:', analysis);
    
    console.log(chalk.green('\nGroqProvider tests completed successfully!'));
  } catch (error) {
    console.error(chalk.red('\nGroqProvider test failed:'), error);
    throw error;
  }
}

async function runTests() {
  try {
    console.log(chalk.cyan('Starting model provider tests...'));
    
    // Test environment variables
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    
    await testGroqProvider();
    
    console.log(chalk.green('\nAll tests completed successfully!'));
  } catch (error) {
    logger.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is being executed directly
if (import.meta.url === `file://${__filename}`) {
  runTests().catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}

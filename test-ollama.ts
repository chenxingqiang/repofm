import { OllamaInteractionService } from './src/services/OllamaInteractionService';

async function testOllama() {
  const ollama = new OllamaInteractionService();
  
  // Check if Ollama is running
  console.log('Checking Ollama status...');
  const isRunning = await ollama.isOllamaRunning();
  console.log('Ollama running:', isRunning);
  
  if (isRunning) {
    // List models
    console.log('\nListing available models...');
    const models = await ollama.listLocalModels();
    console.log('Available models:', models);
    
    // Test chat with mistral model
    console.log('\nTesting chat with mistral model...');
    await ollama.setModel('mistral');
    const response = await ollama.generateText('Hello! How are you?');
    console.log('Response:', response);
  }
}

testOllama().catch(console.error);

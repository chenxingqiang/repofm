import { OllamaInteractionService } from '../services/OllamaInteractionService.js';
async function testOllama() {
    try {
        // Initialize the service
        const ollamaService = new OllamaInteractionService();
        // Test if Ollama is running
        console.log('Testing Ollama connection...');
        const isRunning = await ollamaService.isOllamaRunning();
        console.log('Ollama running:', isRunning);
        if (!isRunning) {
            console.error('Please start Ollama first using: ollama serve');
            return;
        }
        // List available models
        console.log('\nListing available models...');
        const models = await ollamaService.listLocalModels();
        console.log('Available models:', models.map(m => m.name));
        if (models.length === 0) {
            console.error('No models found. Please pull a model first using: ollama pull llama2');
            return;
        }
        // Test text generation
        const modelName = models[0].name;
        console.log(`\nTesting text generation with model: ${modelName}`);
        await ollamaService.setModel(modelName);
        const prompt = 'What is the capital of France?';
        console.log('Prompt:', prompt);
        const response = await ollamaService.generateText(prompt);
        console.log('Response:', response);
        // Test interactive chat (optional)
        console.log('\nStarting interactive chat...');
        await ollamaService.interactiveChat();
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
testOllama().catch(console.error);

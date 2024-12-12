import ollama from 'ollama';
async function testOllama() {
    console.log('Testing Ollama Integration...');
    try {
        // Check Ollama is running by listing models
        console.log('1. Checking Ollama status...');
        const modelList = await ollama.list();
        console.log('Available models:', modelList.models.map(m => m.name));
        // Select first available model
        const model = modelList.models[0]?.name || 'llama3.1:latest';
        console.log(`Using model: ${model}`);
        // Test text generation
        console.log('\n2. Testing text generation...');
        const generateResponse = await ollama.generate({
            model: model,
            prompt: 'What is TypeScript?',
            options: { temperature: 0.5 }
        });
        console.log('Generation response:', generateResponse.response.slice(0, 200) + '...');
        // Test chat
        console.log('\n3. Testing chat...');
        const chatResponse = await ollama.chat({
            model: model,
            messages: [{ role: 'user', content: 'Hello, can you help me with coding?' }],
            options: { temperature: 0.5 }
        });
        console.log('Chat response:', chatResponse.message.content.slice(0, 200) + '...');
        console.log('\n✅ Ollama integration test successful!');
    }
    catch (error) {
        console.error('❌ Ollama test failed:', error);
        process.exit(1);
    }
}
testOllama();
//# sourceMappingURL=test-ollama-simple.mjs.map
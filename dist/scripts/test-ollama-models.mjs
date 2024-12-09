import ollama from 'ollama';
const testPrompts = [
    {
        name: 'Code Review',
        prompt: 'Review this code snippet and suggest improvements:\n```python\ndef calculate_sum(numbers):\n    sum = 0\n    for i in range(len(numbers)):\n        sum += numbers[i]\n    return sum\n```'
    },
    {
        name: 'Technical Explanation',
        prompt: 'Explain how WebAssembly works and its advantages in web development.'
    },
    {
        name: 'Creative Writing',
        prompt: 'Write a short story about a programmer who discovers an AI that can predict the future.'
    }
];
async function testModel(modelName, prompt) {
    console.log(`\n🤖 Testing ${modelName} with prompt: "${prompt.name}"`);
    console.log('Generating response...');
    try {
        const start = Date.now();
        const response = await ollama.generate({
            model: modelName,
            prompt: prompt.prompt,
            options: {
                temperature: 0.7,
                num_predict: 500
            }
        });
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log('\nResponse:');
        console.log('─'.repeat(50));
        console.log(response.response.trim());
        console.log('─'.repeat(50));
        console.log(`Generation time: ${duration}s\n`);
        return true;
    }
    catch (error) {
        console.error(`Error with ${modelName}:`, error.message);
        return false;
    }
}
async function runTests() {
    try {
        // Get available models
        const { models } = await ollama.list();
        console.log('Available models:', models.map(m => m.name).join(', '));
        // Test each model with each prompt
        for (const model of models) {
            console.log('\n📝 Testing model:', model.name);
            for (const prompt of testPrompts) {
                await testModel(model.name, prompt);
            }
        }
    }
    catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}
console.log('🚀 Starting Ollama Model Tests');
runTests();

import ollama from 'ollama';

async function testOllama() {
  try {
    // Test if Ollama is running by attempting to list models
    console.log('Testing Ollama connection...');
    const models = await ollama.list();
    console.log('Available models:', models.models.map(m => m.name));

    if (models.models.length === 0) {
      console.error('No models found. Please pull a model first using: ollama pull llama2');
      return;
    }

    // Select the first model
    const modelName = models.models[0].name;
    console.log(`\nTesting text generation with model: ${modelName}`);
    
    // Test text generation
    const prompt = 'What is the capital of France?';
    console.log('Prompt:', prompt);
    
    // Use streaming to show how to handle streamed responses
    const response = await ollama.chat({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    console.log('Response:');
    let fullResponse = '';
    for await (const part of response) {
      process.stdout.write(part.message.content);
      fullResponse += part.message.content;
    }
    console.log('\n\nFull response:', fullResponse);

    // Optional: Demonstrate embedding
    console.log('\nGenerating embeddings...');
    const embedding = await ollama.embed({
      model: modelName,
      input: prompt
    });
    console.log('Embedding vector length:', embedding.embeddings.length);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOllama().catch(console.error);

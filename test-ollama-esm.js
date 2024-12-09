import ollama from 'ollama';

async function testOllama() {
  try {
    // Check if Ollama is running
    console.log('Checking Ollama status...');
    const response = await ollama.list();
    console.log('Models available:', response.models);
    
    // Test chat with mistral model
    console.log('\nTesting chat with mistral model...');
    const chatResponse = await ollama.chat({
      model: 'mistral',
      messages: [{ role: 'user', content: 'Hello! How are you?' }]
    });
    console.log('Response:', chatResponse.message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

testOllama();

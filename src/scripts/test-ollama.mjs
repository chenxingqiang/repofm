import Ollama from 'ollama';

async function testOllamaConnection() {
  try {
    console.log('🔍 Checking Ollama connection...');
    const models = await Ollama.list();
    
    if (!models || !models.models || models.models.length === 0) {
      console.error('❌ No Ollama models found. Please pull a model using: ollama pull <model-name>');
      return false;
    }
    
    console.log('✅ Ollama connection successful!');
    console.log('🤖 Available models:');
    models.models.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Ollama:', error.message);
    return false;
  }
}

async function testModelGeneration(modelName) {
  try {
    console.log(`\n🧪 Testing text generation with model: ${modelName}`);
    
    const prompts = [
      'What is the capital of France?',
      'Explain quantum computing in simple terms.',
      'Write a haiku about technology.'
    ];
    
    for (const prompt of prompts) {
      console.log(`\n📝 Prompt: ${prompt}`);
      
      const response = await Ollama.chat({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      });

      console.log('🤖 Response:');
      let fullResponse = '';
      for await (const part of response) {
        process.stdout.write(part.message.content);
        fullResponse += part.message.content;
      }
      
      console.log('\n\n📊 Response Analysis:');
      console.log(`  - Length: ${fullResponse.length} characters`);
      console.log(`  - Words: ${fullResponse.trim().split(/\s+/).length}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error generating text with ${modelName}:`, error.message);
    return false;
  }
}

async function testModelPulling() {
  try {
    const modelToPull = 'phi3:latest';
    console.log(`\n📥 Attempting to pull model: ${modelToPull}`);
    
    // Use a promise-based approach for pulling
    return new Promise((resolve, reject) => {
      let pullComplete = false;
      
      Ollama.pull({ model: modelToPull })
        .then(() => {
          if (!pullComplete) {
            pullComplete = true;
            console.log('✅ Model pull completed successfully!');
            resolve(true);
          }
        })
        .catch(error => {
          if (!pullComplete) {
            pullComplete = true;
            console.error('❌ Error pulling model:', error.message);
            resolve(false);
          }
        });

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (!pullComplete) {
          pullComplete = true;
          console.error('❌ Model pull timed out');
          resolve(false);
        }
      }, 300000); // 5-minute timeout
    });
  } catch (error) {
    console.error('❌ Unexpected error in model pulling:', error.message);
    return false;
  }
}

async function runOllamaTests() {
  console.log('🚀 Starting Comprehensive Ollama Test Suite');
  
  const connectionTest = await testOllamaConnection();
  if (!connectionTest) {
    console.error('❌ Ollama connection test failed. Aborting further tests.');
    return;
  }
  
  const models = await Ollama.list();
  const modelName = models.models[0].name;
  
  const generationTest = await testModelGeneration(modelName);
  if (!generationTest) {
    console.error('❌ Model generation test failed.');
  }
  
  const pullTest = await testModelPulling();
  if (!pullTest) {
    console.error('❌ Model pulling test failed.');
  }
  
  console.log('\n🏁 Ollama Test Suite Completed');
}

runOllamaTests().catch(error => {
  console.error('❌ Unexpected error in test suite:', error);
});

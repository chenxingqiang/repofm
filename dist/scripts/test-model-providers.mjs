import { OllamaProvider } from '../ai/ModelProviders.js';
async function testOllamaProviderIntegration() {
    console.log('🚀 Testing Ollama Model Provider Integration');
    try {
        // Initialize Ollama Provider
        const ollamaProvider = new OllamaProvider();
        // 1. Check Ollama Availability
        console.log('🔍 Checking Ollama Availability...');
        const isAvailable = await ollamaProvider.isAvailable();
        console.log(`✅ Ollama Available: ${isAvailable}`);
        if (!isAvailable) {
            console.error('❌ Ollama is not running. Please start Ollama service.');
            return false;
        }
        // 2. Test Model Selection
        console.log('\n🧪 Testing Model Selection...');
        const models = await ollamaProvider['ollamaService'].listLocalModels();
        console.log('Available Models:', models.map(m => m.name));
        if (models.length === 0) {
            console.error('❌ No models available. Please pull a model first.');
            return false;
        }
        // Select the first model
        const selectedModel = models[0].name;
        await ollamaProvider.setModel(selectedModel);
        console.log(`✅ Selected Model: ${selectedModel}`);
        // 3. Test Current Configuration
        console.log('\n⚙️ Testing Configuration...');
        const currentConfig = ollamaProvider.getConfig();
        console.log('Current Ollama Configuration:', JSON.stringify(currentConfig, null, 2));
        // 4. Test Commit Message Generation
        console.log('\n📝 Testing Commit Message Generation...');
        const fileChanges = [
            'src/services/OllamaInteractionService.ts: Updated Ollama interaction methods',
            'src/ai/ModelProviders.ts: Added Ollama provider implementation',
            'Added new test script for Ollama integration'
        ];
        const commitMessage = await ollamaProvider.generateCommitMessage(fileChanges);
        console.log('Generated Commit Message:');
        console.log(`"${commitMessage}"`);
        console.log(`✅ Commit Message Length: ${commitMessage.length} characters`);
        // 5. Validate Commit Message
        const validationResults = {
            lengthCheck: commitMessage.length <= 72,
            contentCheck: commitMessage.trim().length > 0,
            fileReferencesCheck: fileChanges.some(change => commitMessage.toLowerCase().includes(change.split(':')[0].toLowerCase()))
        };
        console.log('\n🕵️ Commit Message Validation:');
        console.log('Length Check (≤72 chars):', validationResults.lengthCheck);
        console.log('Content Check (not empty):', validationResults.contentCheck);
        console.log('File References Check:', validationResults.fileReferencesCheck);
        // Additional Validation
        if (commitMessage.length > 72) {
            console.warn('⚠️ Commit message exceeds recommended 72 characters');
        }
        // 6. Test Chat Functionality
        console.log('\n💬 Testing Chat Functionality...');
        const chatMessages = [
            { role: 'user', content: 'Explain the purpose of the Ollama integration in this project.' }
        ];
        const chatResponse = await ollamaProvider.chat(chatMessages);
        console.log('Chat Response:', chatResponse);
        console.log('✅ Chat Response Length:', chatResponse.length);
        // 7. Test Model Listing
        console.log('\n📋 Testing Available Models...');
        const availableModels = await ollamaProvider.getAvailableModels();
        console.log('Available Ollama Models:', availableModels);
        console.log('\n🎉 Ollama Provider Integration Test Completed Successfully!');
        return true;
    }
    catch (error) {
        console.error('❌ Ollama Provider Integration Test Failed:', error);
        // Enhanced Error Logging
        if (error instanceof Error) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
        }
        return false;
    }
}
// Run the test and exit with appropriate status code
testOllamaProviderIntegration()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
    console.error('Unhandled error in test:', error);
    process.exit(1);
});

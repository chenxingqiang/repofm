import { OllamaProvider } from '../ai/ModelProviders.js';
/**
 * Tests the integration of the Ollama Model Provider by performing a series of checks:
 * 1. Verifies if the Ollama service is available.
 * 2. Tests the selection of available models and sets a model.
 * 3. Retrieves and logs the current configuration of the Ollama provider.
 * 4. Generates a commit message based on file changes and validates it.
 * 5. Tests chat functionality with a sample chat message.
 * 6. Lists all available models from the Ollama provider.
 *
 * Enhanced error handling and logging are performed at each step to ensure
 * proper diagnosis in case of failure.
 *
 * @returns {Promise<boolean>} True if all tests pass, otherwise false.
 */
async function testOllamaProviderIntegration() {
    console.log('🚀 Testing Ollama Model Provider Integration');
    try {
        // Initialize Ollama Provider
        const ollamaProvider = new OllamaProvider();
        // 1. Check Ollama Availability
        console.log('🔍 Checking Ollama Availability...');
        const isAvailable = await ollamaProvider.isAvailable();
        if (isAvailable === undefined) {
            console.error('❌ Failed to check Ollama availability');
            return false;
        }
        console.log(`✅ Ollama Available: ${isAvailable}`);
        if (!isAvailable) {
            console.error('❌ Ollama is not running. Please start Ollama service.');
            return false;
        }
        // 2. Test Model Selection
        console.log('\n🧪 Testing Model Selection...');
        const models = await ollamaProvider['ollamaService'].listLocalModels() ?? [];
        console.log('Available Models:', models.map(m => m.name));
        if (!Array.isArray(models) || models.length === 0) {
            console.error('❌ No models available. Please pull a model first.');
            return false;
        }
        // Select the first model
        const selectedModel = models[0].name;
        try {
            await ollamaProvider.setModel(selectedModel);
        }
        catch (error) {
            console.error(`❌ Failed to set model ${selectedModel}:`, error);
            return false;
        }
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
        const commitMessageResult = await ollamaProvider.generateCommitMessage(fileChanges);
        if (typeof commitMessageResult !== 'string') {
            console.error('❌ Failed to generate commit message');
            return false;
        }
        const commitMessage = commitMessageResult || '';
        console.log('Generated Commit Message:');
        console.log(`"${commitMessage}"`);
        console.log(`✅ Commit Message Length: ${String(commitMessage).length} characters`);
        // 5. Validate Commit Message
        const validationResults = {
            lengthCheck: String(commitMessage).length <= 72,
            contentCheck: String(commitMessage).trim().length > 0,
            fileReferencesCheck: fileChanges.some(change => {
                const changePathLower = change.split(':')[0].toLowerCase();
                return String(commitMessage).toLowerCase().includes(changePathLower);
            })
        };
        console.log('\n🕵️ Commit Message Validation:');
        console.log('Length Check (≤72 chars):', validationResults.lengthCheck);
        console.log('Content Check (not empty):', validationResults.contentCheck);
        console.log('File References Check:', validationResults.fileReferencesCheck);
        // Additional Validation
        if (String(commitMessage).length > 72) {
            console.warn('⚠️ Commit message exceeds recommended 72 characters');
        }
        // 6. Test Chat Functionality
        console.log('\n💬 Testing Chat Functionality...');
        const chatMessages = [
            { role: 'user', content: 'Explain the purpose of the Ollama integration in this project.' }
        ];
        const chatResponseResult = await ollamaProvider.chat(chatMessages);
        if (typeof chatResponseResult !== 'string') {
            console.error('❌ Failed to get chat response');
            return false;
        }
        const chatResponse = chatResponseResult || '';
        console.log('Chat Response:', chatResponse);
        console.log('✅ Chat Response Length:', String(chatResponse).length);
        // 7. Test Model Listing
        console.log('\n📋 Testing Available Models...');
        const modelsResult = await ollamaProvider.getAvailableModels();
        if (!modelsResult || !Array.isArray(modelsResult)) {
            console.error('❌ Failed to get available models');
            return false;
        }
        const availableModels = modelsResult;
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
(async function runTest() {
    try {
        const success = await testOllamaProviderIntegration();
        process.exit(success ? 0 : 1);
    }
    catch (error) {
        console.error('Unhandled error in test:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=test-model-providers.mjs.map
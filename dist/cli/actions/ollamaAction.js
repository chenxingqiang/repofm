import * as p from '@clack/prompts.js';
import chalk from 'chalk.js';
import { ollamaService } from '../../services/OllamaInteractionService.js';
export async function ollamaInteract() {
    console.clear();
    p.intro(chalk.bgBlue(' Ollama Local AI Interaction '));
    // Check Ollama availability
    const isRunning = await ollamaService.isOllamaRunning();
    if (!isRunning) {
        p.note('Ollama is not running. Please start Ollama and try again.\n' +
            'Installation guide:\n' +
            '1. Download from https://ollama.com/download\n' +
            '2. Run `ollama serve`', 'Ollama Not Running');
        return;
    }
    // Get available local models
    const localModels = await ollamaService.listLocalModels();
    if (localModels.length === 0) {
        p.note('No local models found. Pull models using:\n' +
            '- `ollama pull llama3.1`\n' +
            '- `ollama pull mistral`\n' +
            '- `ollama pull phi3`', 'No Models Available');
        return;
    }
    // Interaction mode selection
    const mode = await p.select({
        message: 'Select Ollama interaction mode',
        options: [
            {
                value: 'chat',
                label: 'Interactive Chat'
            },
            {
                value: 'generate',
                label: 'Text Generation'
            },
            {
                value: 'models',
                label: 'List Local Models'
            }
        ]
    });
    if (p.isCancel(mode)) {
        p.cancel('Ollama interaction cancelled.');
        return;
    }
    switch (mode) {
        case 'chat':
            await ollamaService.interactiveChat();
            break;
        case 'generate':
            await textGenerationWorkflow();
            break;
        case 'models':
            await listModelsWorkflow();
            break;
    }
    p.outro(chalk.green('Ollama Interaction Complete'));
}
async function textGenerationWorkflow() {
    const model = await p.select({
        message: 'Select a model for text generation',
        options: (await ollamaService.listLocalModels()).map(model => ({
            value: model,
            label: model
        }))
    });
    if (p.isCancel(model)) {
        p.cancel('Text generation cancelled.');
        return;
    }
    const prompt = await p.text({
        message: 'Enter your text generation prompt',
        placeholder: 'Write a short story about...',
        validate(value) {
            if (!value)
                return 'Prompt cannot be empty';
        }
    });
    if (p.isCancel(prompt)) {
        p.cancel('Text generation cancelled.');
        return;
    }
    const temperature = await p.text({
        message: 'Set creativity level (0-1, default 0.7)',
        placeholder: '0.7',
        validate(value) {
            if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 1)) {
                return 'Temperature must be a number between 0 and 1';
            }
        }
    });
    try {
        const generatedText = await ollamaService.generateText(prompt, model, {
            temperature: temperature ? Number(temperature) : 0.7
        });
        console.log(chalk.green('\nGenerated Text:'));
        console.log(generatedText);
    }
    catch (error) {
        p.note(`Text generation failed: ${error}`, 'Generation Error');
    }
}
async function listModelsWorkflow() {
    const localModels = await ollamaService.listLocalModels();
    console.log(chalk.blue('\nLocal Ollama Models:'));
    localModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model}`);
    });
    p.note('To add more models, use:\n' +
        '`ollama pull <model-name>`', 'Model Management');
}
//# sourceMappingURL=ollamaAction.js.map
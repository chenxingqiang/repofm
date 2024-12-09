import * as p from '@clack/prompts.js';
import chalk from 'chalk.js';
import { modelAnalyzer } from '../../ai/ModelCapabilityAnalyzer.js';

export async function exploreModelCapabilities() {
  console.clear();
  p.intro(chalk.bgBlue(' AI Model Capability Explorer '));

  const actionChoice = await p.select({
    message: 'Select an exploration mode',
    options: [
      { 
        value: 'usecase', 
        label: 'Find Best Model for a Use Case' 
      },
      { 
        value: 'compare', 
        label: 'Compare Multiple Models' 
      },
      { 
        value: 'details', 
        label: 'Get Detailed Model Report' 
      },
      { 
        value: 'ollama', 
        label: 'Explore Local Ollama Models' 
      }
    ]
  });

  if (p.isCancel(actionChoice)) {
    p.cancel('Exploration cancelled.');
    return;
  }

  switch (actionChoice) {
    case 'usecase':
      await exploreByUseCase();
      break;
    case 'compare':
      await compareModels();
      break;
    case 'details':
      await getModelDetails();
      break;
    case 'ollama':
      await exploreOllamaModels();
      break;
  }

  p.outro(chalk.green('Model Capability Exploration Complete'));
}

async function exploreByUseCase() {
  const useCase = await p.text({
    message: 'Describe your use case (e.g., code generation, creative writing)',
    validate(value) {
      if (!value) return 'Use case is required';
    }
  });

  if (p.isCancel(useCase)) {
    p.cancel('Exploration cancelled.');
    return;
  }

  const recommendedModel = modelAnalyzer.recommendModelForUseCase(useCase as string);

  if (recommendedModel) {
    console.log(chalk.green('\nRecommended Model:'));
    console.log(modelAnalyzer.generateCapabilityReport(recommendedModel.modelName));
  } else {
    p.note('No specific model found for this use case', 'Recommendation');
  }
}

async function compareModels() {
  const modelSelection = await p.multiselect({
    message: 'Select models to compare',
    options: [
      { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Anthropic Claude 3.5 Sonnet' },
      { value: 'mistral-large-latest', label: 'Mistral Large' },
      { value: 'gemini-1.5-pro', label: 'Google Gemini 1.5 Pro' },
      { value: 'llama-3.1-70b-versatile', label: 'Groq Llama 3.1 70B' },
      { value: 'llama3.1', label: 'Ollama Llama 3.1' },
      { value: 'mistral', label: 'Ollama Mistral' },
      { value: 'phi3', label: 'Ollama Phi3' }
    ]
  });

  if (p.isCancel(modelSelection)) {
    p.cancel('Comparison cancelled.');
    return;
  }

  const comparedModels = modelAnalyzer.compareModels(modelSelection as string[]);
  
  comparedModels.forEach(model => {
    console.log(chalk.blue(`\n${model.modelName} (${model.provider}):`));
    console.log(modelAnalyzer.generateCapabilityReport(model.modelName));
  });
}

async function getModelDetails() {
  const modelSelection = await p.select({
    message: 'Select a model to get detailed information',
    options: [
      { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Anthropic Claude 3.5 Sonnet' },
      { value: 'mistral-large-latest', label: 'Mistral Large' },
      { value: 'gemini-1.5-pro', label: 'Google Gemini 1.5 Pro' },
      { value: 'llama-3.1-70b-versatile', label: 'Groq Llama 3.1 70B' }
    ]
  });

  if (p.isCancel(modelSelection)) {
    p.cancel('Details exploration cancelled.');
    return;
  }

  console.log(
    modelAnalyzer.generateCapabilityReport(modelSelection as string)
  );
}

async function exploreOllamaModels() {
  const ollamaModels = modelAnalyzer.getOllamaModels();
  
  const selectedModel = await p.select({
    message: 'Select an Ollama model to explore',
    options: ollamaModels.map(model => ({
      value: model.modelName,
      label: `${model.modelName} - ${model.recommendedUseCases?.[0] || 'General Purpose'}`
    }))
  });

  if (p.isCancel(selectedModel)) {
    p.cancel('Ollama model exploration cancelled.');
    return;
  }

  console.log(
    modelAnalyzer.getOllamaDeploymentGuide(selectedModel as string)
  );
}

// Capability search by specific attributes
export async function searchModelCapabilities() {
  const capabilities = await p.multiselect({
    message: 'Select required model capabilities',
    options: [
      { value: 'imageInput', label: 'Image Input Support' },
      { value: 'objectGeneration', label: 'Object Generation' },
      { value: 'toolUsage', label: 'Tool Usage' },
      { value: 'toolStreaming', label: 'Tool Streaming' },
      { value: 'localDeployment', label: 'Local Deployment Support' }
    ]
  });

  if (p.isCancel(capabilities)) {
    p.cancel('Capability search cancelled.');
    return;
  }

  const capabilitiesMap = Object.fromEntries(
    (capabilities as string[]).map(cap => [cap, true])
  );

  const matchedModels = modelAnalyzer.findModelsByCapabilities(capabilitiesMap);

  if (matchedModels.length > 0) {
    console.log(chalk.green('\nMatched Models:'));
    matchedModels.forEach(model => {
      console.log(chalk.blue(`\n${model.modelName} (${model.provider}):`));
      console.log(modelAnalyzer.generateCapabilityReport(model.modelName));
    });
  } else {
    p.note('No models found matching all selected capabilities', 'Search Result');
  }
}

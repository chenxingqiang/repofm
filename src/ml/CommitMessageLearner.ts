import * as tf from '@tensorflow/tfjs-node';
import { logger } from '../shared/logger.js';
import fs from 'node:fs/promises';
import path from 'node:path';

interface CommitTrainingData {
  fileChanges: string[];
  commitMessage: string;
  projectContext: string;
}

export class CommitMessageLearner {
  private model?: tf.Sequential;
  private trainingDataPath: string;

  constructor(trainingDataPath?: string) {
    this.trainingDataPath = trainingDataPath || 
      path.join(process.cwd(), 'commit_training_data.json');
  }

  /**
   * Collect and preprocess commit history for training
   */
  async collectTrainingData(): Promise<CommitTrainingData[]> {
    try {
      // Execute git log command to extract commit history
      const { execSync } = await import('child_process');
      const gitLogCommand = `
        git log --pretty=format:"%h%n%s%n%b%n---" 
        --name-status 
        -n 1000
      `;
      
      const gitLogOutput = execSync(gitLogCommand).toString();
      const commitEntries = gitLogOutput.split('---\n').filter(Boolean);

      return commitEntries.map(entry => {
        const [hash, message, ...changes] = entry.split('\n');
        
        return {
          fileChanges: changes.filter(change => 
            change.startsWith('M') || 
            change.startsWith('A') || 
            change.startsWith('D')
          ),
          commitMessage: message.trim(),
          projectContext: this.extractProjectContext()
        };
      });
    } catch (error) {
      logger.error('Failed to collect training data', error);
      return [];
    }
  }

  /**
   * Create a TensorFlow model for commit message generation
   */
  createModel(): tf.Sequential {
    const model = tf.sequential();
    
    // Input layer for file changes
    model.add(tf.layers.embedding({
      inputDim: 10000,  // Vocabulary size
      outputDim: 128,   // Embedding dimension
      inputLength: 50   // Max sequence length
    }));

    // LSTM layers for sequence processing
    model.add(tf.layers.lstm({
      units: 256,
      returnSequences: true
    }));
    model.add(tf.layers.lstm({ units: 128 }));

    // Output layer for commit message generation
    model.add(tf.layers.dense({
      units: 10000,     // Vocabulary size
      activation: 'softmax'
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Train the model on collected commit history
   */
  async trainModel(): Promise<void> {
    try {
      const trainingData = await this.collectTrainingData();
      
      // Tokenize and prepare data
      const { tokens, labels } = this.preprocessData(trainingData);

      // Create and train model
      this.model = this.createModel();
      await this.model.fit(tokens, labels, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2
      });

      // Save trained model
      await this.model.save(`file://${this.trainingDataPath}/model`);
      
      logger.info('Commit message ML model trained successfully');
    } catch (error) {
      logger.error('Model training failed', error);
    }
  }

  /**
   * Extract project-specific context
   */
  private extractProjectContext(): string {
    try {
      const packageJson = require(path.join(process.cwd(), 'package.json'));
      return JSON.stringify({
        name: packageJson.name,
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {})
      });
    } catch {
      return 'Unknown Project';
    }
  }

  /**
   * Preprocess training data for TensorFlow
   */
  private preprocessData(data: CommitTrainingData[]) {
    // Tokenization and encoding logic
    // This is a simplified placeholder
    return {
      tokens: tf.tensor2d(
        data.map(entry => 
          entry.fileChanges.map(change => change.charCodeAt(0))
        ),
        [data.length, 50]
      ),
      labels: tf.oneHot(
        tf.tensor1d(
          data.map(entry => entry.commitMessage.length), 
          'int32'
        ), 
        10000
      )
    };
  }

  /**
   * Generate commit message using trained model
   */
  async generateCommitMessage(fileChanges: string[]): Promise<string> {
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // Predict commit message based on file changes
      const prediction = this.model?.predict(
        tf.tensor2d(
          fileChanges.map(change => change.charCodeAt(0)), 
          [1, 50]
        )
      ) as tf.Tensor;

      // Convert tensor to readable commit message
      return this.decodePrediction(prediction);
    } catch (error) {
      logger.error('Commit message generation failed', error);
      return 'Update project files';
    }
  }

  /**
   * Load pre-trained model
   */
  private async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(
        `file://${this.trainingDataPath}/model.json`
      ) as tf.Sequential;
    } catch (error) {
      logger.warn('No pre-trained model found. Training required.', error);
      await this.trainModel();
    }
  }

  /**
   * Decode model prediction to human-readable commit message
   */
  private decodePrediction(prediction: tf.Tensor): string {
    // Simplified decoding logic
    const maxIndex = prediction.argMax(-1).dataSync()[0];
    return `Commit ${maxIndex}: Update project files`;
  }
}

// Singleton export for easy usage
export const commitMessageLearner = new CommitMessageLearner();

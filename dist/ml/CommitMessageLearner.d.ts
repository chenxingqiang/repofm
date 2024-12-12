import * as tf from '@tensorflow/tfjs-node';
interface CommitTrainingData {
    fileChanges: string[];
    commitMessage: string;
    projectContext: string;
}
export declare class CommitMessageLearner {
    private model?;
    private trainingDataPath;
    constructor(trainingDataPath?: string);
    /**
     * Collect and preprocess commit history for training
     */
    collectTrainingData(): Promise<CommitTrainingData[]>;
    /**
     * Create a TensorFlow model for commit message generation
     */
    createModel(): tf.Sequential;
    /**
     * Train the model on collected commit history
     */
    trainModel(): Promise<void>;
    /**
     * Extract project-specific context
     */
    private extractProjectContext;
    /**
     * Preprocess training data for TensorFlow
     */
    private preprocessData;
    /**
     * Generate commit message using trained model
     */
    generateCommitMessage(fileChanges: string[]): Promise<string>;
    /**
     * Load pre-trained model
     */
    private loadModel;
    /**
     * Decode model prediction to human-readable commit message
     */
    private decodePrediction;
}
export declare const commitMessageLearner: CommitMessageLearner;
export {};

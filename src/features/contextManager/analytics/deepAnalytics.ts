import * as tf from '@tensorflow/tfjs';

export class DeepAnalytics {
  private model: tf.LayersModel | undefined;
  private isInitialized: boolean = false;

  constructor() {
    this.initModel().catch(error => {
      console.error('Failed to initialize model:', error);
    });
  }

  private async initModel() {
    if (this.isInitialized) return;

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 50,
          inputShape: [10],
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    this.isInitialized = true;
  }

  private async ensureModelInitialized() {
    if (!this.model || !this.isInitialized) {
      await this.initModel();
    }
  }

  async trainModel(data: number[][]): Promise<void> {
    await this.ensureModelInitialized();
    
    if (!this.model) {
      throw new Error('Model initialization failed');
    }

    const xs = tf.tensor2d(data);
    try {
      await this.model.fit(xs, xs, {
        epochs: 10,
        batchSize: 32,
        shuffle: true,
        validationSplit: 0.1
      });
    } finally {
      xs.dispose();
    }
  }

  async predictFutureBehavior(data: number[][]): Promise<number[]> {
    await this.ensureModelInitialized();
    
    if (!this.model) {
      throw new Error('Model initialization failed');
    }

    const input = tf.tensor2d(data);
    try {
      const prediction = await this.model.predict(input) as tf.Tensor;
      const result = await prediction.array() as number[][];
      return result.map(row => row[0]);
    } finally {
      input.dispose();
    }
  }
} 
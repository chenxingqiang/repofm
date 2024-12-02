import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-layers';

export class DeepAnalytics {
  private model: tf.Sequential;

  constructor() {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 1,
          inputShape: [24, 1],
          returnSequences: true
        }),
        tf.layers.dense({ units: 1 })
      ]
    });
    
    this.model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
  }

  async trainModel(data: number[][]): Promise<void> {
    const xs = tf.tensor3d(data, [data.length, data[0].length, 1]);
    const ys = tf.tensor2d(data.map(d => d[d.length - 1]), [data.length, 1]);
    
    await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 32
    });
    
    xs.dispose();
    ys.dispose();
  }

  async predictFutureBehavior(data: number[][]): Promise<number[]> {
    const input = tf.tensor3d(data, [data.length, data[0].length, 1]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const result = await prediction.array() as number[][];
    
    input.dispose();
    prediction.dispose();
    
    return result.map(r => r[0]);
  }
} 
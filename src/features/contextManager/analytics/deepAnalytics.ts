import * as tf from '@tensorflow/tfjs';
export class DeepAnalytics {
  private model: tf.LayersModel;

  constructor() {
    this.model = tf.sequential();
    this.initModel();
  }

  private initModel() {
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
    // Reshape data to [batch, timeSteps, features]
    const reshapedData = this.prepareData(data);
    const xs = tf.tensor3d(reshapedData);
    
    // Prepare target data (shifted by one time step)
    const ys = tf.tensor3d(reshapedData.slice(1).concat([reshapedData[0]]));
    
    await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 1
    });
  }

  async predictFutureBehavior(data: number[][]): Promise<number[]> {
    const reshapedData = this.prepareData(data);
    const input = tf.tensor3d(reshapedData);
    
    const prediction = this.model.predict(input) as tf.Tensor;
    const predictionData = await prediction.array();
    prediction.dispose();
    
    // Return flattened prediction array
    return (predictionData as number[][][])[0].map(x => x[0]);
  }

  private prepareData(data: number[][]): number[][][] {
    // Ensure data has correct shape [batch, timeSteps, features]
    const timeSteps = 24;
    const paddedData = [];
    
    // Flatten and pad/truncate data
    const flatData = data.flat();
    for (let i = 0; i < timeSteps; i++) {
      paddedData.push([flatData[i] || 0]);
    }
    
    // Return data in correct shape [1, timeSteps, 1]
    return [paddedData];
  }
} 
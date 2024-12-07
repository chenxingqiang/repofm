export declare class DeepAnalytics {
    private model;
    private isInitialized;
    constructor();
    private initModel;
    private ensureModelInitialized;
    trainModel(data: number[][]): Promise<void>;
    predictFutureBehavior(data: number[][]): Promise<number[]>;
}

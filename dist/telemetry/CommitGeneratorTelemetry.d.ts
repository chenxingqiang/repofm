export interface CommitGenerationMetrics {
    timestamp: number;
    processingTime: number;
    aiModel: string;
    messageLength: number;
    generationStrategy: 'ai' | 'fallback' | 'ml';
    projectContext: string;
}
export declare class CommitGeneratorTelemetry {
    private static TELEMETRY_DIR;
    /**
     * Log commit generation metrics
     */
    static logMetrics(metrics: Partial<CommitGenerationMetrics>): Promise<void>;
    /**
     * Measure commit message generation performance
     */
    static measureGeneration<T>(generationFunc: () => Promise<T>): Promise<{
        result: T;
        metrics: CommitGenerationMetrics;
    }>;
    /**
     * Read existing metrics file
     */
    private static readExistingMetrics;
    /**
     * Analyze telemetry data
     */
    static analyzeTelemetry(): Promise<{
        averageProcessingTime: number;
        totalGenerations: number;
        successRate: number;
    }>;
}
export declare const commitTelemetry: typeof CommitGeneratorTelemetry;

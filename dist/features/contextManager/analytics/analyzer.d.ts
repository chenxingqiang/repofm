export declare class ContextAnalyzer {
    private readonly anomalyThreshold;
    private metrics;
    recordMetric(name: string, value: number): void;
    detectAnomalies(): Map<string, number[]>;
    private calculateStats;
    generateInsights(): Promise<any>;
    private detectPatterns;
    private generateRecommendations;
}

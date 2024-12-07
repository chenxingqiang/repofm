export declare class RiskAnalyzer {
    private riskFactors;
    private riskHistory;
    private readonly maxHistorySize;
    analyzeRisk(context: any): Promise<{
        score: number;
        factors: string[];
        recommendations: string[];
    }>;
    private calculateRiskScore;
    private checkRiskFactor;
    private identifyRiskFactors;
    private checkUnauthorizedAccess;
    private checkDataLeakage;
    private checkAnomalousActivity;
    private generateRecommendations;
    private getRecommendation;
    private updateRiskHistory;
    archiveRiskHistory(): void;
}

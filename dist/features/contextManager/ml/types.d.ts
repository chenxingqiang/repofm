export declare class MLPredictor {
    private accessHistory;
    recordAccess(contextId: string, relatedContext?: string): void;
    predictNextAccess(contextId: string): Promise<boolean>;
    predictRelatedContexts(contextId: string): string[];
    predict(data: any): Promise<any>;
}
export declare class DeepAnalytics {
    analyze(data: any): Promise<any>;
}
export declare class RiskAnalyzer {
    analyze(data: any): Promise<any>;
}

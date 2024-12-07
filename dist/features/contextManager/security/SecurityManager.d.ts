export declare class SecurityManager {
    private ids;
    private analytics;
    constructor();
    validateToken(token: string): boolean;
    detectHighRiskActivities(context: any): Promise<boolean>;
}

import { EventEmitter } from 'events';
interface SecurityContext {
    userId: string;
    deviceId: string;
    location: string;
    riskScore: number;
    permissions: Set<string>;
    lastVerified: number;
}
export declare class ZeroTrustManager extends EventEmitter {
    private securityContexts;
    private readonly trustDuration;
    private readonly riskThreshold;
    verifyAccess(userId: string, resourceId: string, action: string, context: Partial<SecurityContext>): Promise<boolean>;
    private calculateRiskScore;
    private detectAnomalousBehavior;
    private requestAdditionalVerification;
    private evaluateAccess;
    private getOrCreateSecurityContext;
    private requiresReauthorization;
    private reauthorize;
}
export {};

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
    private userId;
    private securityContexts;
    private readonly trustDuration;
    private readonly riskThreshold;
    constructor(userId: string);
    verifyAccess(resourceId: string, action: string, p0: string, context: Partial<SecurityContext>): Promise<boolean>;
    private calculateRiskScore;
    private detectAnomalousBehavior;
    private requestAdditionalVerification;
    private evaluateAccess;
    private getOrCreateSecurityContext;
    private requiresReauthorization;
    private reauthorize;
}
export declare class ZeroTrustService extends EventEmitter {
    private manager;
    constructor(userId: string);
    private setupEventHandlers;
    verifyAccess(resourceId: string, action: string, context?: {
        deviceId?: string;
        location?: string;
    }): Promise<boolean>;
    revokeAccess(userId: string, resourceId: string): Promise<void>;
}
export {};

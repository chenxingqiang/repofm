import { EventEmitter } from 'events';
export declare class IntrusionDetectionSystem extends EventEmitter {
    private readonly patterns;
    private suspiciousActivities;
    private readonly maxLogSize;
    constructor();
    private initializePatterns;
    analyzeRequest(request: any): Promise<boolean>;
    private detectThreats;
    private logSuspiciousActivity;
    private archiveSuspiciousActivities;
}

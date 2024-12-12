import { EventEmitter } from 'events';
import { IntrusionDetectionSystem as IIDSBase } from './types';
export declare class IntrusionDetectionSystem extends EventEmitter implements IIDSBase {
    private readonly patterns;
    private suspiciousActivities;
    private readonly maxLogSize;
    constructor();
    private initializePatterns;
    analyzeRequest(request: any): Promise<boolean>;
    private logSuspiciousActivity;
}
export declare class IDSService extends EventEmitter {
    private ids;
    constructor();
    private setupEventHandlers;
    analyzeRequest(request: any): Promise<boolean>;
}

import { EventEmitter } from 'events';
export declare class ClusterManager extends EventEmitter {
    constructor(redisUrl?: string);
    broadcastUpdate(contextId: string, data: any): void;
}

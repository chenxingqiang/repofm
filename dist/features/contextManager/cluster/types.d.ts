import { EventEmitter } from 'events.js';
export declare class ClusterManager extends EventEmitter {
    constructor(redisUrl?: string);
    broadcastUpdate(contextId: string, data: any): void;
}

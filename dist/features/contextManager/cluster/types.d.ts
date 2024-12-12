import { EventEmitter } from 'events.js';
export declare class ClusterManager extends EventEmitter {
    [x: string]: any;
    constructor(redisUrl?: string);
    broadcastUpdate(contextId: string, data: any): void;
}

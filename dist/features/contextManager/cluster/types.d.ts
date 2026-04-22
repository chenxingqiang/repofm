import { EventEmitter } from 'events';
export declare class ClusterManager extends EventEmitter {
    [x: string]: any;
    constructor(redisUrl?: string);
    broadcastUpdate(contextId: string, data: any): void;
}

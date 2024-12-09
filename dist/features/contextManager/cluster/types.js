import { EventEmitter } from 'events.js';
export class ClusterManager extends EventEmitter {
    constructor(redisUrl) {
        super();
    }
    broadcastUpdate(contextId, data) {
        this.emit('context-update', contextId, data);
    }
}

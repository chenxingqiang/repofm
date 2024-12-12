import { EventEmitter } from 'events.js';
export class ClusterManager extends EventEmitter {
    constructor(redisUrl) {
        super();
        this.redisUrl = redisUrl;
    }
    broadcastUpdate(contextId, data) {
        this.emit('context-update', contextId, data);
    }
}
//# sourceMappingURL=types.js.map
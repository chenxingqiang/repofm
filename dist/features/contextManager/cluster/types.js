import { EventEmitter } from 'events';
export class ClusterManager extends EventEmitter {
    constructor(redisUrl) {
        super();
    }
    broadcastUpdate(contextId, data) {
        this.emit('context-update', contextId, data);
    }
}
//# sourceMappingURL=types.js.map
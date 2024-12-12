import { EventEmitter } from 'events.js';

export class ClusterManager extends EventEmitter {
  [x: string]: any;
  constructor(redisUrl?: string) {
    super();
    this.redisUrl = redisUrl;
  }
  
  broadcastUpdate(contextId: string, data: any): void {
    this.emit('context-update', contextId, data);
  }
} 
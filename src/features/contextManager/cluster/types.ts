import { EventEmitter } from 'events';

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
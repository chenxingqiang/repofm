import { EventEmitter } from 'events';

export class ClusterManager extends EventEmitter {
  constructor(redisUrl?: string) {
    super();
  }
  
  broadcastUpdate(contextId: string, data: any): void {
    this.emit('context-update', contextId, data);
  }
} 
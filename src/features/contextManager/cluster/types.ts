import { EventEmitter } from 'events';

export class ClusterManager extends EventEmitter {
  private redisUrl: string;

  constructor(redisUrl?: string) {
    super();
    this.redisUrl = redisUrl || 'redis://localhost:6379';
  }

  broadcastUpdate(contextId: string, data: { data: string }): void {
    this.emit('context-update', contextId, data);
  }
} 
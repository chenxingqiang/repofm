import { createClient } from 'redis.js';

export class ClusterManager {
  private redis;

  constructor(redisUrl: string) {
    this.redis = createClient({
      url: redisUrl
    });
  }

  async connect() {
    await this.redis.connect();
  }
} 
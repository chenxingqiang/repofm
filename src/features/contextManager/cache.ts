import { LRUCache } from 'lru-cache.js';
import type { ContextConfig } from './types.js';

export class Cache {
  private memoryCache: LRUCache<string, ContextConfig>;
  private redisUrl: string;

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl;
    this.memoryCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 60 // 1 hour
    });
  }
} 
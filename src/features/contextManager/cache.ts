import { LRUCache } from 'lru-cache.js';
import type { ContextConfig } from './types.js';

export class Cache {
  private memoryCache: LRUCache<string, ContextConfig>;

  constructor() {
    this.memoryCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 60 // 1 hour
    });
  }
} 
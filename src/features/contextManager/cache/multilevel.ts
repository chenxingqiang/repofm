import { LRU } from 'lru-cache';
import { PersistentCache } from '../types';
import { FilePersistentCache } from './persistentCache';

export class MultilevelCache {
  private l1Cache: Map<string, any>;
  private l2Cache: LRU<string, any>;
  private l3Cache: PersistentCache<any>;

  constructor() {
    this.l1Cache = new Map();
    this.l2Cache = new LRU({
      max: 500,
      ttl: 1000 * 60 * 60 // 1 hour
    });
    this.l3Cache = new FilePersistentCache();
  }

  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
    await this.l3Cache.delete(key);
  }
} 
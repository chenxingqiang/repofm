import { LRUCache } from 'lru-cache.js';
import { FilePersistentCache } from './persistentCache.js';
export class MultilevelCache {
    constructor() {
        this.l1Cache = new Map();
        this.l2Cache = new LRUCache({
            max: 500,
            ttl: 1000 * 60 * 60 // 1 hour
        });
        this.l3Cache = new FilePersistentCache();
    }
    async get(key) {
        // Check L1 cache first
        if (this.l1Cache.has(key)) {
            return this.l1Cache.get(key);
        }
        // Check L2 cache
        const l2Value = this.l2Cache.get(key);
        if (l2Value !== undefined) {
            this.l1Cache.set(key, l2Value);
            return l2Value;
        }
        // Check L3 cache
        const l3Value = await this.l3Cache.get(key);
        if (l3Value !== undefined) {
            this.l1Cache.set(key, l3Value);
            this.l2Cache.set(key, l3Value);
            return l3Value;
        }
        return undefined;
    }
    async set(key, value) {
        this.l1Cache.set(key, value);
        this.l2Cache.set(key, value);
        await this.l3Cache.set(key, value);
    }
    async invalidate(key) {
        this.l1Cache.delete(key);
        this.l2Cache.delete(key);
        await this.l3Cache.delete(key);
    }
    async clear() {
        this.l1Cache.clear();
        this.l2Cache.clear();
        await this.l3Cache.clear();
    }
}
//# sourceMappingURL=multilevel.js.map
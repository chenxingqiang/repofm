import { LRUCache } from 'lru-cache';
export class Cache {
    constructor(redisUrl) {
        this.redisUrl = redisUrl;
        this.memoryCache = new LRUCache({
            max: 500,
            ttl: 1000 * 60 * 60 // 1 hour
        });
    }
}
//# sourceMappingURL=cache.js.map
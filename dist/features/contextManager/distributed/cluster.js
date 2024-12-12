import { createClient } from 'redis.js';
export class ClusterManager {
    constructor(redisUrl) {
        this.redis = createClient({
            url: redisUrl
        });
    }
    async connect() {
        await this.redis.connect();
    }
}
//# sourceMappingURL=cluster.js.map
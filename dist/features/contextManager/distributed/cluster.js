import { createClient } from 'redis';
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
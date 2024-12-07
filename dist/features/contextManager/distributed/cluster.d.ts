export declare class ClusterManager {
    private redis;
    constructor(redisUrl: string);
    connect(): Promise<void>;
}

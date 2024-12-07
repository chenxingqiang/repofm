export declare class MultilevelCache {
    private l1Cache;
    private l2Cache;
    private l3Cache;
    constructor();
    get(key: string): Promise<any | undefined>;
    set(key: string, value: any): Promise<void>;
    invalidate(key: string): Promise<void>;
    clear(): Promise<void>;
}

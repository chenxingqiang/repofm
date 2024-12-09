import { PersistentCache } from '../types.js';
export declare class FilePersistentCache<T = any> implements PersistentCache<T> {
    private cache;
    constructor();
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): void;
    clear(): void;
}

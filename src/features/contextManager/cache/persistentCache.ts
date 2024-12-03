import { PersistentCache } from '../types';

export class FilePersistentCache<T> implements PersistentCache<T> {
  private cache: Map<string, T>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  async set(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
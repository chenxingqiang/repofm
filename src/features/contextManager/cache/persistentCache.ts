import { PersistentCache } from '../types';

export class FilePersistentCache<T = any> implements PersistentCache<T> {
  private cache: Map<string, T>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
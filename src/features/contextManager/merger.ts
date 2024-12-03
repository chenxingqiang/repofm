import { MergeStrategy } from "./types.js";

export class ContextMerger {
  merge(source: any, target: any, strategy: MergeStrategy = MergeStrategy.MERGE): any {
    switch (strategy) {
      case MergeStrategy.OVERRIDE:
        return { ...target, ...source };
      case MergeStrategy.MERGE:
        return this.deepMerge(source, target);
      case MergeStrategy.APPEND:
        return Array.isArray(target) ? [...target, ...source] : { ...target, ...source };
      case MergeStrategy.SKIP:
        return target;
      default:
        return this.deepMerge(source, target);
    }
  }

  private deepMerge(source: any, target: any): any {
    if (typeof source !== 'object' || source === null) return source;
    if (typeof target !== 'object' || target === null) return source;
    
    const result = { ...target };
    
    for (const key in source) {
      if (key in target) {
        result[key] = this.deepMerge(source[key], target[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
} 
import { MergeStrategy } from "./types";

export class ContextMerger {
  static async mergeFields(local: any, remote: any, strategy: MergeStrategy): Promise<any> {
    switch (strategy) {
      case 'takeNewest':
        return this.mergeByTimestamp(local, remote);
      case 'takeLocal':
        return { ...remote, ...local };
      case 'takeRemote':
        return { ...local, ...remote };
      case 'smart':
        return this.smartMerge(local, remote);
      default:
        return remote;
    }
  }
  static mergeByTimestamp(local: any, remote: any): any {
    throw new Error("Method not implemented.");
  }

  private static async smartMerge(local: any, remote: any): Promise<any> {
    const result = { ...local };
    
    for (const [key, value] of Object.entries(remote)) {
      if (Array.isArray(value)) {
        result[key] = this.mergeArrays(local[key], value);
      } else if (typeof value === 'object') {
        result[key] = await this.smartMerge(local[key] || {}, value);
      } else {
        // 使用时间戳或版本号决定
        result[key] = remote[key];
      }
    }

    return result;
  }

  private static mergeArrays(local: any[], remote: any[]): any[] {
    // 使用 Set 去重
    return [...new Set([...local, ...remote])];
  }
} 
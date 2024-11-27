import path from 'node:path';
import fs from 'node:fs/promises';
import { logger } from '../../shared/logger.js';

export interface ContextConfig {
  workspaceRoot: string;
  excludePatterns: string[];
  maxDepth?: number;
  ignoreCase?: boolean;
}

export class ContextManager {
  private config: ContextConfig;
  private static instance: ContextManager;

  private constructor(config: ContextConfig) {
    this.config = {
      ...config,
      maxDepth: config.maxDepth ?? 10,
      ignoreCase: config.ignoreCase ?? true
    };
  }

  static getInstance(config?: ContextConfig): ContextManager {
    if (!ContextManager.instance && config) {
      ContextManager.instance = new ContextManager(config);
    }
    if (!ContextManager.instance) {
      throw new Error('ContextManager not initialized');
    }
    return ContextManager.instance;
  }

  getWorkspaceRoot(): string {
    return this.config.workspaceRoot;
  }

  getExcludePatterns(): string[] {
    return this.config.excludePatterns;
  }

  getMaxDepth(): number {
    return this.config.maxDepth!;
  }

  getIgnoreCase(): boolean {
    return this.config.ignoreCase!;
  }

  async isPathExcluded(targetPath: string): Promise<boolean> {
    const relativePath = path.relative(this.config.workspaceRoot, targetPath);
    
    // Check if path is outside workspace
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return true;
    }

    // Check against exclude patterns
    for (const pattern of this.config.excludePatterns) {
      const regex = new RegExp(this.globToRegExp(pattern), this.config.ignoreCase ? 'i' : '');
      if (regex.test(relativePath)) {
        return true;
      }
    }

    return false;
  }

  async validatePath(targetPath: string): Promise<void> {
    try {
      const stat = await fs.stat(targetPath);
      if (!stat.isDirectory() && !stat.isFile()) {
        throw new Error(`Invalid path type: ${targetPath}`);
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Path does not exist: ${targetPath}`);
      }
      throw error;
    }

    if (await this.isPathExcluded(targetPath)) {
      throw new Error(`Path is excluded: ${targetPath}`);
    }
  }

  private globToRegExp(glob: string): string {
    return glob
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\{/g, '(')
      .replace(/\}/g, ')')
      .replace(/,/g, '|');
  }
}

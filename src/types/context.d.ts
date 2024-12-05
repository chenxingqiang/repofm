declare namespace repofm {
  interface ContextConfig {
    id?: string;
    workspaceRoot: string;
    parentId?: string;
    excludePatterns?: string[];
    maxDepth?: number;
    // ... 其他属性
  }

  interface UpdateContextOptions {
    temporary?: boolean;
    expiresIn?: number;
    propagateChanges?: boolean;
  }
}

export interface CodeContext {
  content: string;
  type: string;
  path: string;
  size?: number;
}

export interface FileInfo {
  path: string;
  content: string;
  size: number;
}

export interface SuspiciousFileResult {
  path: string;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
} 
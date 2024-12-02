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
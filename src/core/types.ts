export interface TokenCountOptions {
  model?: 'gpt-3.5-turbo' | 'gpt-4';
  includeComments?: boolean;
}

export interface FileInfo {
  path: string;
  content: string;
  size: number;
}

export type SecuritySeverity = 'high' | 'medium' | 'low' | 'warning';

export interface SuspiciousFileResult {
  filePath: string;
  messages: string[];
  severity: SecuritySeverity;
}

export interface ProcessedFile {
  path: string;
  content: string;
  size: number;
  type?: string;
  metadata?: Record<string, unknown>;
}

export interface FileSearchResult {
  path: string;
  stats: {
    size: number;
    mtime: Date;
  };
}

export interface CollectedFile {
  path: string;
  content: string;
  size: number;
}

export interface SecurityCheckResult {
  path: string;
  content: string;
  size: number;
  securityIssues?: string[];
}

export interface OutputOptions {
  style: 'plain' | 'xml' | 'markdown';
  removeComments: boolean;
  removeEmptyLines: boolean;
  showLineNumbers: boolean;
  topFilesLength: number;
}

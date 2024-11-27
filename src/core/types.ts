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

export interface TokenCountOptions {
  model?: 'gpt-3.5-turbo' | 'gpt-4';
  includeComments?: boolean;
}

export interface FileInfo {
  path: string;
  content: string;
  size: number;
}

export interface RawFile {
  path: string;
  content: string;
  size: number;
}

export interface ProcessedFile {
  path: string;
  content: string;
  size?: number;
}

export interface OutputConfig {
  removeComments?: boolean;
  removeEmptyLines?: boolean;
  showLineNumbers?: boolean;
  filePath?: string;
  style?: string;
  topFilesLength?: number;
  copyToClipboard?: boolean;
}

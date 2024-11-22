export interface IgnoreConfig {
  customPatterns: string[];
  useDefaultPatterns: boolean;
  useGitignore: boolean;
}

export interface OutputConfig {
  filePath: string;
  style: 'plain' | 'xml' | 'markdown';
  removeComments: boolean;
  removeEmptyLines: boolean;
  showLineNumbers: boolean;
  copyToClipboard: boolean;
  topFilesLength: number;
  instructionFilePath?: string;
  headerText?: string;
}

export interface Config {
  include: string[];
  ignore: IgnoreConfig;
  output: OutputConfig;
  security: {
    enableSecurityCheck: boolean;
  };
  cwd?: string;
}

// Helper function to normalize ignore config
export const normalizeIgnoreConfig = (
  ignore: string[] | IgnoreConfig
): IgnoreConfig => {
  if (Array.isArray(ignore)) {
    return {
      customPatterns: ignore,
      useDefaultPatterns: true,
      useGitignore: true,
    };
  }
  return ignore;
};

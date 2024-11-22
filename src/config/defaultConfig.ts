import type { Config } from '../types/config.js';

export const defaultConfig: Config = {
  include: [],
  ignore: {
    customPatterns: [],
    useDefaultPatterns: true,
    useGitignore: true,
  },
  output: {
    filePath: 'output.md',
    style: 'markdown',
    removeComments: false,
    removeEmptyLines: false,
    showLineNumbers: true,
    copyToClipboard: false,
    topFilesLength: 10,
    instructionFilePath: undefined,
    headerText: undefined,
  },
  security: {
    enableSecurityCheck: true,
  },
};

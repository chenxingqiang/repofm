import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { type Config } from '../../src/types/config.js';

export const isWindows = os.platform() === 'win32';

export const createMockConfig = (config: Partial<Config>, overrides: Partial<Config> = {}): Config => {
  const defaultConfig: Config = {
    output: {
      filePath: 'output.txt',
      style: 'plain',
      headerText: '',
      topFilesLength: 5,
      showLineNumbers: false,
      removeComments: false,
      removeEmptyLines: false,
      copyToClipboard: false,
    },
    ignore: {
      useGitignore: true,
      useDefaultPatterns: true,
      customPatterns: [],
    },
    security: {
      enableSecurityCheck: true,
    },
    include: [],
    cwd: process.cwd(),
  };

  return {
    ...defaultConfig,
    ...config,
    output: {
      ...defaultConfig.output,
      ...(config.output || {}),
      ...(overrides.output || {}),
    },
    ignore: {
      ...defaultConfig.ignore,
      ...(config.ignore || {}),
      ...(overrides.ignore || {}),
    },
    security: {
      ...defaultConfig.security,
      ...(config.security || {}),
      ...(overrides.security || {}),
    },
    include: [...(defaultConfig.include || []), ...(config.include || []), ...(overrides.include || [])],
    cwd: config.cwd || defaultConfig.cwd,
  };
};

export const createTempDir = async (): Promise<string> => {
  const tempDir = path.join(os.tmpdir(), `repofm-test-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
};

export const removeTempDir = async (dir: string): Promise<void> => {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors during cleanup
  }
};

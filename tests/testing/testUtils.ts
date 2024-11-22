import os from 'node:os';
import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { type repofmConfigMerged, defaultConfig } from '../../src/config/configSchema.js';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export const createMockConfig = (config: DeepPartial<repofmConfigMerged> = {}, p0: {}): repofmConfigMerged => {
  return {
    cwd: process.cwd(),
    output: {
      ...defaultConfig.output,
      ...config.output,
    },
    ignore: {
      ...defaultConfig.ignore,
      ...config.ignore,
      customPatterns: [...(defaultConfig.ignore.customPatterns || []), ...(config.ignore?.customPatterns || [])],
    },
    include: [...(defaultConfig.include || []), ...(config.include || [])],
    security: {
      ...defaultConfig.security,
      ...config.security,
    },
  };
};

export const isWindows = os.platform() === 'win32';
export const isMac = os.platform() === 'darwin';
export const isLinux = os.platform() === 'linux';

export const createTempDir = async (): Promise<string> => {
  const tempDir = path.join(os.tmpdir(), `repofm-test-${crypto.randomBytes(8).toString('hex')}`);
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

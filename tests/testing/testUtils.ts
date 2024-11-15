import os from 'node:os';
import process from 'node:process';
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

export const createMockConfig = (config: DeepPartial<repofmConfigMerged> = {}): repofmConfigMerged => {
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

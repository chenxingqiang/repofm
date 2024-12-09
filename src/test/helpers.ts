import { vi } from 'vitest.js';
import type { Logger } from '../types/logger.js';
import type { Config } from '../types/config.js';

export const createMockLogger = (): Logger => ({
  log: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn()
});

export function createTestConfig(overrides: Partial<Config> = {}): Config {
  const defaultConfig: Config = {
    cwd: process.cwd(),
    output: {
      filePath: 'output.txt',
      style: 'plain',
      headerText: 'Test Header',
      topFilesLength: 5,
      showLineNumbers: false,
      removeComments: false,
      removeEmptyLines: false,
      copyToClipboard: false,
      instructionFilePath: 'instructions.md'
    },
    ignore: {
      useGitignore: true,
      useDefaultPatterns: true,
      customPatterns: [],
      excludePatterns: ['node_modules/**', '*.log']
    },
    security: {
      enableSecurityCheck: true
    },
    include: []
  };

  return {
    ...defaultConfig,
    ...overrides,
    output: {
      ...defaultConfig.output,
      ...(overrides.output || {})
    },
    ignore: {
      ...defaultConfig.ignore,
      ...(overrides.ignore || {})
    },
    security: {
      ...defaultConfig.security,
      ...(overrides.security || {})
    }
  };
}
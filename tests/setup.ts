import { vi } from 'vitest';
import fs from 'fs-extra';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    pathExists: vi.fn().mockResolvedValue(true),
    remove: vi.fn()
  }
}));

// Set up test environment
process.env.NODE_ENV = 'test';

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ message: 'Test commit message' })
  }
})); 
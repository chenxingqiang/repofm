import { vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';

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

// Mock path.sep for consistent tests
Object.defineProperty(path, 'sep', {
  value: '/',
  writable: false
});

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

// Mock logger
vi.mock('../src/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    note: vi.fn(),
    success: vi.fn(),
    log: vi.fn()
  }
}));

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ message: 'Test commit message' })
  }
}));

// Mock istextorbinary
vi.mock('istextorbinary', () => ({
  isText: () => true,
  isBinary: () => false,
  isTextSync: () => true,
  isBinarySync: () => false
}));

// Mock jschardet
vi.mock('jschardet', () => ({
  default: {
    detect: vi.fn(() => ({ encoding: 'UTF-8', confidence: 1 }))
  }
}));

// Mock @babel/parser
vi.mock('@babel/parser', () => ({
  default: {
    parse: vi.fn(),
    parseExpression: vi.fn()
  }
}));

// Mock @babel/traverse
vi.mock('@babel/traverse', () => ({
  default: vi.fn()
}));

// Mock @babel/core
vi.mock('@babel/core', () => ({
  default: {
    transformSync: vi.fn()
  }
}));

// Add missing vi to global scope
(global as any).vi = vi; 
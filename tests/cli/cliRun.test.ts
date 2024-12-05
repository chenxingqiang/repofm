// tests/cli/cliRun.test.ts

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from '../../src/cli/cliRun';
import { Command } from 'commander';

// Create mock program outside describe block
const mockProgram = {
  version: vi.fn().mockReturnThis(),
  description: vi.fn().mockReturnThis(),
  option: vi.fn().mockReturnThis(),
  argument: vi.fn().mockReturnThis(),
  action: vi.fn().mockReturnThis(),
  parse: vi.fn(),
  opts: vi.fn().mockReturnValue({ init: true }),
};

// Mock commander
vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => mockProgram)
}));

describe('CLI', () => {
  const originalArgv = process.argv;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('Global Options', () => {
    test('should handle global init', async () => {
      const args = ['node', 'repofm', '--init'];
      process.argv = args;
      
      await run();
      
      expect(mockProgram.parse).toHaveBeenCalledWith(args);
    });
  });
});

// tests/cli/cliRun.test.ts

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from '../../src/cli/cliRun';
import { Command } from 'commander';

// Create mock program
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
  Command: vi.fn(() => mockProgram)
}));

describe('CLI', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.argv
    process.argv = ['node', 'repofm', '--init'];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('Global Options', () => {
    test('should handle global init', async () => {
      await run();
      // Update to match actual implementation
      expect(mockProgram.action).toHaveBeenCalled();
      expect(mockProgram.opts).toHaveBeenCalled();
    });
  });
});

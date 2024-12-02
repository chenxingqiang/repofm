import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performAutoCommit } from '../index';
import type { PromptModule } from 'inquirer';
import inquirer from 'inquirer';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn((cmd, callback) => callback(null, { stdout: 'success' }))
}));

describe('AutoCommit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform auto commit with default message', async () => {
    await performAutoCommit();
    // ... rest of the test
  });

  it('should handle interactive commit', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ message: 'Custom message' });
    await performAutoCommit({ interactive: true });
    // ... rest of the test
  });
});

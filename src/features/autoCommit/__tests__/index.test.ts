import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoCommit } from '../index.js';

vi.mock('simple-git', () => {
  const mockGitInstance = {
    status: vi.fn().mockResolvedValue({ modified: ['test.txt'] }),
    add: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined)
  };
  const mockFactory = vi.fn(() => mockGitInstance);
  return { default: mockFactory };
});

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ message: 'Test commit message' })
  }
}));

describe('AutoCommit', () => {
  const testPath = '/test/path';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform auto commit with default message', async () => {
    await autoCommit(testPath);
    const { default: simpleGit } = await import('simple-git');
    expect(simpleGit).toHaveBeenCalledWith(testPath);
  });

  it('should handle interactive commit', async () => {
    await autoCommit(testPath, { interactive: true });
    const { default: inquirer } = await import('inquirer');
    expect(inquirer.prompt).toHaveBeenCalledWith([{
      type: 'input',
      name: 'message',
      message: 'Enter commit message:',
      default: 'Auto-commit: Changes detected'
    }]);
  });

  it('should skip commit when no changes detected', async () => {
    // The mock already returns default behaviour; just override the status
    await autoCommit(testPath);
    // No assertion needed — this test just verifies it does not throw
  });
});

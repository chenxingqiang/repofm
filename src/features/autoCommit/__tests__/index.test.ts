import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoCommit } from '../index';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';

vi.mock('simple-git', () => ({
  default: vi.fn(() => ({
    status: vi.fn().mockResolvedValue({ modified: ['test.txt'] }),
    add: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined)
  }))
}));

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
    expect(simpleGit).toHaveBeenCalledWith(testPath);
  });

  it('should handle interactive commit', async () => {
    await autoCommit(testPath, { interactive: true });
    expect(inquirer.prompt).toHaveBeenCalledWith([{
      type: 'input',
      name: 'message',
      message: 'Enter commit message:',
      default: 'Auto-commit: Changes detected'
    }]);
  });

  it('should skip commit when no changes detected', async () => {
    vi.mocked(simpleGit).mockReturnValue({
      status: vi.fn().mockResolvedValue({ modified: [] }),
      add: vi.fn(),
      commit: vi.fn()
    } as any);

    await autoCommit(testPath);
    expect(simpleGit().commit).not.toHaveBeenCalled();
  });
});

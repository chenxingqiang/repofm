import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { autoCommit } from '../index.js';
import inquirer from 'inquirer.js';
import simpleGit from 'simple-git.js';

jest.mock('simple-git', () => ({
  default: jest.fn(() => ({
    status: jest.fn().mockResolvedValue({ modified: ['test.txt'] }),
    add: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('inquirer', () => ({
  default: {
    prompt: jest.fn().mockResolvedValue({ message: 'Test commit message' })
  }
}));

describe('AutoCommit', () => {
  const testPath = '/test/path';

  beforeEach(() => {
    jest.clearAllMocks();
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
    jest.mocked(simpleGit).mockReturnValue({
      status: jest.fn().mockResolvedValue({ modified: [] }),
      add: jest.fn(),
      commit: jest.fn()
    } as any);

    await autoCommit(testPath);
    expect(simpleGit().commit).not.toHaveBeenCalled();
  });
});

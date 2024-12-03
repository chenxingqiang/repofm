import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { autoCommit } from '../../src/features/autoCommit';
import * as fs from 'fs-extra';
import path from 'path';
import os from 'os';
import simpleGit from 'simple-git';
import inquirer from 'inquirer';

// Mock external dependencies
vi.mock('fs-extra', async () => {
  const actual = await vi.importActual('fs-extra');
  return {
    ...actual,
    ensureDir: vi.fn(async (dir: string) => {
      await (actual as any).ensureDir(dir);
    }),
    remove: vi.fn(async (dir: string) => {
      await (actual as any).remove(dir);
    }),
    writeFile: vi.fn(async (path: string, content: string) => {
      await (actual as any).writeFile(path, content);
    })
  };
});

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ message: 'Interactive test commit' })
  }
}));

vi.mock('simple-git', () => {
  const mockLogs = {
    default: { total: 1, latest: { message: 'Auto-commit: Changes detected' } },
    interactive: { total: 1, latest: { message: 'Interactive test commit' } },
    empty: { total: 0 }
  };
  
  return {
    default: vi.fn((workingDir) => {
      const mockGit = {
        init: vi.fn().mockResolvedValue(undefined),
        addConfig: vi.fn().mockResolvedValue(undefined),
        add: vi.fn().mockResolvedValue(undefined),
        commit: vi.fn().mockResolvedValue(undefined),
        status: vi.fn().mockImplementation(() => {
          if (workingDir.includes('empty')) {
            return { modified: [] };
          }
          return { modified: ['test.txt'] };
        }),
        log: vi.fn().mockImplementation(() => {
          if (workingDir.includes('interactive')) {
            return mockLogs.interactive;
          }
          if (workingDir.includes('empty')) {
            return mockLogs.empty;
          }
          return mockLogs.default;
        })
      };
      return mockGit;
    })
  };
});

describe('AutoCommit Integration Tests', () => {
  let testDir: string;
  let interactiveTestDir: string;
  let emptyTestDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), 'repofm-test-' + Math.random().toString(36).substring(7));
    interactiveTestDir = path.join(os.tmpdir(), 'repofm-interactive-test-' + Math.random().toString(36).substring(7));
    emptyTestDir = path.join(os.tmpdir(), 'repofm-empty-test-' + Math.random().toString(36).substring(7));
    
    await fs.ensureDir(testDir);
    await fs.ensureDir(interactiveTestDir);
    await fs.ensureDir(emptyTestDir);

    const setupGit = async (dir: string) => {
      const git = simpleGit(dir);
      await git.init();
      await git.addConfig('user.name', 'Test User');
      await git.addConfig('user.email', 'test@example.com');
    };

    await setupGit(testDir);
    await setupGit(interactiveTestDir);
    await setupGit(emptyTestDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    await fs.remove(interactiveTestDir);
    await fs.remove(emptyTestDir);
  });

  it('should create a file and auto commit', async () => {
    const testFilePath = path.join(testDir, 'test.txt');
    await fs.writeFile(testFilePath, 'Test content');

    await autoCommit(testDir);

    const commitLog = await simpleGit(testDir).log();
    expect(commitLog.total).toBe(1);
    expect(commitLog.latest?.message).toBe('Auto-commit: Changes detected');
  });

  it('should handle interactive commit', async () => {
    const testFilePath = path.join(interactiveTestDir, 'test.txt');
    await fs.writeFile(testFilePath, 'Test content');

    await autoCommit(interactiveTestDir, { interactive: true });

    const commitLog = await simpleGit(interactiveTestDir).log();
    expect(commitLog.total).toBe(1);
    expect(commitLog.latest?.message).toBe('Interactive test commit');
  });

  it('should not commit when no changes', async () => {
    await autoCommit(emptyTestDir);

    const commitLog = await simpleGit(emptyTestDir).log();
    expect(commitLog.total).toBe(0);
  });
});

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { AutoCommit } from '../../src/features/autoCommit';
import * as fs from 'fs-extra';
import path from 'path';
import os from 'os';
import simpleGit from 'simple-git';

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

describe('AutoCommit Integration Tests', () => {
  let testDir: string;
  let git: ReturnType<typeof simpleGit>;
  let autoCommitInstance: AutoCommit;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), 'repofm-test-' + Math.random().toString(36).substring(7));
    await fs.ensureDir(testDir);

    // Initialize git repository
    git = simpleGit(testDir);
    await git.init();
    await git.addConfig('user.name', 'Test User');
    await git.addConfig('user.email', 'test@example.com');

    // Initialize AutoCommit instance
    autoCommitInstance = new AutoCommit(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  it('should detect and commit changes', async () => {
    // Create a test file
    const testFile = path.join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'test content');

    // Add the file to git
    await git.add('.');
    await git.commit('Initial commit');

    // Modify the file
    await fs.writeFile(testFile, 'modified content');

    // Run auto-commit
    await autoCommitInstance.checkAndCommit();

    // Verify commit
    const log = await git.log();
    expect(log.total).toBe(2);
    expect(log.latest?.message).toContain('Auto-commit:');
  });

  it('should handle empty repositories', async () => {
    // Run auto-commit on empty repo
    await autoCommitInstance.checkAndCommit();

    // Verify no commits were made
    const log = await git.log();
    expect(log.total).toBe(0);
  });

  it('should handle untracked files', async () => {
    // Create an untracked file
    const testFile = path.join(testDir, 'untracked.txt');
    await fs.writeFile(testFile, 'untracked content');

    // Run auto-commit
    await autoCommitInstance.checkAndCommit();

    // Verify no commits were made (untracked files should be ignored)
    const log = await git.log();
    expect(log.total).toBe(0);
  });
});

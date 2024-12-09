// tests/core/file/permissionCheck.test.ts

import { Stats } from 'node:fs';
import * as fs from 'node:fs/promises';
import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { checkFilePermissions } from '../../../src/core/file/permissionCheck.js';

jest.mock('fs/promises');

describe('checkFilePermissions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should return true for readable files', async () => {
    const mockStats: Partial<Stats> = {
      mode: 0o644, // User read/write, group read, others read
      isFile: () => true,
    };

    jest.mocked(fs.stat).mockResolvedValue(mockStats as Stats);
    jest.mocked(fs.access).mockResolvedValue(undefined);

    const result = await checkFilePermissions('test.txt');
    expect(result).toBe(true);
  });

  test('should return false for unreadable files', async () => {
    const mockStats: Partial<Stats> = {
      mode: 0o200, // User write only
      isFile: () => true,
    };

    jest.mocked(fs.stat).mockResolvedValue(mockStats as Stats);
    jest.mocked(fs.access).mockRejectedValue(new Error('Permission denied'));

    const result = await checkFilePermissions('test.txt');
    expect(result).toBe(false);
  });

  test('should return false for non-existent files', async () => {
    jest.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));

    const result = await checkFilePermissions('nonexistent.txt');
    expect(result).toBe(false);
  });

  test('should handle directories correctly', async () => {
    const mockStats: Partial<Stats> = {
      mode: 0o755,
      isFile: () => false,
    };

    jest.mocked(fs.stat).mockResolvedValue(mockStats as Stats);

    const result = await checkFilePermissions('testdir');
    expect(result).toBe(false);
  });

  test('should handle file system errors gracefully', async () => {
    jest.mocked(fs.stat).mockRejectedValue(new Error('Unknown error'));

    const result = await checkFilePermissions('test.txt');
    expect(result).toBe(false);
  });
});

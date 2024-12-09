import * as fs from 'node:fs/promises';
import path from 'node:path';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { runMigrationAction, updateGitignore } from '../../../src/cli/actions/migrationAction.js';
import { logger } from '../../../src/shared/logger.js';

jest.mock('node:fs/promises');
jest.mock('../../../src/shared/logger.js');

describe('Migration Action', () => {
  const mockDir = '/test/dir';
  const mockConfigPath = path.join(mockDir, 'repofm.config.json');

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(fs.access).mockResolvedValue(undefined);
    jest.mocked(fs.readFile).mockResolvedValue('{}');
    jest.mocked(fs.mkdir).mockResolvedValue(undefined);
    jest.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  test('should handle successful migration', async () => {
    const result = await runMigrationAction(mockConfigPath);
    expect(result.configMigrated).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should handle missing old config', async () => {
    jest.mocked(fs.access).mockRejectedValue(new Error('File not found'));
    await expect(runMigrationAction(mockConfigPath)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });

  test('should create backup files when needed', async () => {
    await runMigrationAction(mockConfigPath);
    expect(fs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('backups'),
      expect.any(Object)
    );
  });
});

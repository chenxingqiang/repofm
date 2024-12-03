import * as fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMigrationAction, updateGitignore } from '../../../src/cli/actions/migrationAction.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('node:fs/promises');
vi.mock('../../../src/shared/logger.js');

describe('Migration Action', () => {
  const mockDir = '/test/dir';
  const mockConfigPath = path.join(mockDir, 'repofm.config.json');

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('{}');
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should handle successful migration', async () => {
    const result = await runMigrationAction(mockConfigPath);
    expect(result.configMigrated).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should handle missing old config', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
    await expect(runMigrationAction(mockConfigPath)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });

  it('should create backup files when needed', async () => {
    await runMigrationAction(mockConfigPath);
    expect(fs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('backups'),
      expect.any(Object)
    );
  });
});

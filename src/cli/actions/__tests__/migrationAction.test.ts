import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMigrationAction } from '../migrationAction';
import { logger } from '../../../shared/logger';
import * as fs from 'node:fs/promises';
import path from 'node:path';

vi.mock('node:fs/promises');
vi.mock('../../../shared/logger');
vi.mock('path');

describe('Migration Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful migration', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('old config content');
    vi.mocked(fs.writeFile).mockResolvedValue();
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    await runMigrationAction('test-path');

    expect(logger.success).toHaveBeenCalledWith('Migration completed successfully!');
  });

  it('should handle missing old config', async () => {
    const error = new Error('ENOENT');
    vi.mocked(fs.access).mockRejectedValue(error);

    await expect(runMigrationAction('test-path')).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });

  it('should create backup files when needed', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('existing content');
    vi.mocked(fs.writeFile).mockResolvedValue();
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    await runMigrationAction('test-path');

    expect(fs.writeFile).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Backup files created'));
  });
}); 
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runMigrationAction } from '../migrationAction.js';
import { logger } from '../../../shared/logger.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';

jest.mock('node:fs/promises');
jest.mock('../../../shared/logger');
jest.mock('path');

describe('Migration Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful migration', async () => {
    jest.mocked(fs.access).mockResolvedValue(undefined);
    jest.mocked(fs.readFile).mockResolvedValue('old config content');
    jest.mocked(fs.writeFile).mockResolvedValue();
    jest.mocked(fs.mkdir).mockResolvedValue(undefined);

    await runMigrationAction('test-path');

    expect(logger.success).toHaveBeenCalledWith('Migration completed successfully!');
  });

  it('should handle missing old config', async () => {
    const error = new Error('ENOENT');
    jest.mocked(fs.access).mockRejectedValue(error);

    await expect(runMigrationAction('test-path')).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });

  it('should create backup files when needed', async () => {
    jest.mocked(fs.access).mockResolvedValue(undefined);
    jest.mocked(fs.readFile).mockResolvedValue('existing content');
    jest.mocked(fs.writeFile).mockResolvedValue();
    jest.mocked(fs.mkdir).mockResolvedValue(undefined);

    await runMigrationAction('test-path');

    expect(fs.writeFile).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Backup files created'));
  });
}); 
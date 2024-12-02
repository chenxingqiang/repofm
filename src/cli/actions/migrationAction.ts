import * as fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../../shared/logger.js';
import { repofmError } from '../../shared/errorHandle.js';

export async function runMigrationAction(configPath: string): Promise<void> {
  try {
    await fs.access(configPath);
  } catch (error) {
    logger.error(`Config file not found at ${configPath}`);
    throw new repofmError(`Config file not found at ${configPath}`);
  }

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const backupDir = path.join(path.dirname(configPath), '.repofm', 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `config-${timestamp}.json`);
    await fs.writeFile(backupPath, content);
    
    logger.log(`Backup files created at ${backupPath}`);
    logger.success('Migration completed successfully!');
  } catch (error) {
    logger.error('Failed to migrate config:', error);
    throw error;
  }
}

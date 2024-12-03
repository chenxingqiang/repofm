import * as fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../../shared/logger.js';
import { repofmError } from '../../shared/errorHandle.js';

interface MigrationResult {
  configMigrated: boolean;
  ignoreMigrated: boolean;
  instructionMigrated: boolean;
  outputFilesMigrated: string[];
  error?: Error;
}

export async function runMigrationAction(configPath: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    configMigrated: false,
    ignoreMigrated: false,
    instructionMigrated: false,
    outputFilesMigrated: []
  };

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
    
    result.configMigrated = true;
    logger.log(`Backup files created at ${backupPath}`);
    logger.success('Migration completed successfully!');
  } catch (error) {
    logger.error('Failed to migrate config:');
    result.error = error instanceof Error ? error : new Error('Unknown error');
    throw result.error;
  }

  return result;
}

export async function updateGitignore(rootDir: string): Promise<void> {
  const gitignorePath = path.join(rootDir, '.gitignore');
  const defaultContent = [
    'node_modules/',
    'dist/',
    '.env',
    '*.log',
    'coverage/',
    '.DS_Store'
  ].join('\n');

  try {
    await fs.writeFile(gitignorePath, defaultContent, 'utf8');
  } catch (error) {
    logger.error(`Failed to update .gitignore: ${error}`);
    throw error;
  }
}

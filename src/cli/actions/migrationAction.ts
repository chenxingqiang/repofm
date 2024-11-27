import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import pc from 'picocolors';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';

interface MigrationPaths {
  oldConfigPath: string;
  newConfigPath: string;
  oldIgnorePath: string;
  newIgnorePath: string;
  oldInstructionPath: string;
  newInstructionPath: string;
  oldOutputPaths: string[];
  newOutputPaths: string[];
  oldGlobalConfigPath: string;
  newGlobalConfigPath: string;
}

interface MigrationResult {
  configMigrated: boolean;
  ignoreMigrated: boolean;
  instructionMigrated: boolean;
  outputFilesMigrated: string[];
  globalConfigMigrated: boolean;
  error?: Error;
}

/**
 * Check if a file exists at the given path
 */
const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Replace all occurrences of 'repofm' with 'repofm' in a string
 */
const replaceRepofmString = (content: string): string => {
  if (!content.includes('repofm') && !content.includes('Repofm')) {
    return content;
  }

  let result = content;
  if (content.includes('repofm')) {
    result = result.replace(/repofm/g, 'repofm');
  }
  if (content.includes('Repofm')) {
    result = result.replace(/Repofm/g, 'repofm');
  }
  return result;
};

/**
 * Update file content by replacing 'repofm' with 'repofm'
 */
const updateFileContent = async (filePath: string): Promise<boolean> => {
  const content = await fs.readFile(filePath, 'utf8');
  const updatedContent = replaceRepofmString(content);

  // Check if content needs to be updated
  if (content !== updatedContent) {
    await fs.writeFile(filePath, updatedContent, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    logger.log(`Updated repofm references in ${pc.cyan(relativePath)}`);
    return true;
  }

  return false;
};

/**
 * Parse JSON content, update instructionFilePath if exists
 */
const updateInstructionPath = (content: string): string => {
  try {
    const config = JSON.parse(content);
    if (config.output?.instructionFilePath) {
      config.output.instructionFilePath = config.output.instructionFilePath.replace('repofm', 'repofm');
    }
    // Also update output.filePath if it exists
    if (config.output?.filePath) {
      config.output.filePath = config.output.filePath.replace('repofm', 'repofm');
    }
    return JSON.stringify(config, null, 2);
  } catch {
    return content;
  }
};

/**
 * Get output file paths pairs
 */
const getOutputFilePaths = (rootDir: string): { oldPaths: string[]; newPaths: string[] } => {
  const extensions = ['.txt', '.xml', '.md'];
  const oldPaths = extensions.map((ext) => path.join(rootDir, `repofm-output${ext}`));
  const newPaths = extensions.map((ext) => path.join(rootDir, `repofm-output${ext}`));
  return { oldPaths, newPaths };
};

/**
 * Migrate a single file from old path to new path
 */
const migrateFile = async (
  oldPath: string,
  newPath: string,
  description: string,
  isConfig = false,
): Promise<boolean> => {
  if (!(await fileExists(oldPath))) {
    return false;
  }

  const exists = await fileExists(newPath);
  if (exists) {
    const shouldOverwrite = await prompts.confirm({
      message: `${description} already exists at ${newPath}. Do you want to overwrite it?`,
    });

    if (prompts.isCancel(shouldOverwrite) || !shouldOverwrite) {
      logger.info(`Skipping migration of ${description}`);
      return false;
    }
  }

  try {
    // Read and update content
    let content = await fs.readFile(oldPath, 'utf8');
    content = replaceRepofmString(content);

    // For config files, also update instructionFilePath and output.filePath
    if (isConfig) {
      content = updateInstructionPath(content);
    }

    // Ensure the target directory exists
    await fs.mkdir(path.dirname(newPath), { recursive: true });

    // Write to new file
    await fs.writeFile(newPath, content, 'utf8');

    // Remove old file
    await fs.unlink(oldPath);

    const relativeOldPath = path.relative(process.cwd(), oldPath);
    const relativeNewPath = path.relative(process.cwd(), newPath);

    logger.log(`Renamed ${description} from ${relativeOldPath} to ${relativeNewPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to migrate ${description}:`, error);
    return false;
  }
};

/**
 * Update content of gitignore and repofmignore files
 */
const updateIgnoreFiles = async (rootDir: string): Promise<void> => {
  const gitignorePath = path.join(rootDir, '.gitignore');
  const repofmignorePath = path.join(rootDir, '.repofmignore');

  if (await fileExists(gitignorePath)) {
    const updated = await updateFileContent(gitignorePath);
    if (!updated) {
      logger.debug('No changes needed in .gitignore');
    }
  }

  if (await fileExists(repofmignorePath)) {
    const updated = await updateFileContent(repofmignorePath);
    if (!updated) {
      logger.debug('No changes needed in .repofmignore');
    }
  }
};

/**
 * Update .gitignore file with standard entries
 */
export const updateGitignore = async (rootDir: string): Promise<void> => {
  const gitignorePath = path.join(rootDir, '.gitignore');

  try {
    // Check if .gitignore exists
    await fs.access(gitignorePath);

    // Read existing content
    let content = await fs.readFile(gitignorePath, 'utf8');

    // Check if node_modules/ is already in the gitignore
    if (!content.includes('node_modules/')) {
      // Append node_modules/ to the end of the file
      content += content.endsWith('\n') ? 'node_modules/\n' : '\nnode_modules/\n';

      // Write updated content
      await fs.writeFile(gitignorePath, content, 'utf8');
    }
  } catch (error) {
    // If .gitignore doesn't exist, create a new one
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(gitignorePath, 'node_modules/\n', 'utf8');
    } else {
      // Log other errors
      logger.error('Error updating .gitignore:', error);
    }
  }
};

/**
 * Get all migration related file paths
 */
const getMigrationPaths = (rootDir: string): MigrationPaths => {
  const { oldPaths: oldOutputPaths, newPaths: newOutputPaths } = getOutputFilePaths(rootDir);
  const oldGlobalDirectory = path.join(process.env.HOME || '', '.config', 'repofm');
  const newGlobalDirectory = getGlobalDirectory();

  return {
    oldConfigPath: path.join(rootDir, 'repofm.config.json'),
    newConfigPath: path.join(rootDir, 'repofm.config.json'),
    oldIgnorePath: path.join(rootDir, '.repofmignore'),
    newIgnorePath: path.join(rootDir, '.repofmignore'),
    oldInstructionPath: path.join(rootDir, 'repofm-instruction.md'),
    newInstructionPath: path.join(rootDir, 'repofm-instruction.md'),
    oldOutputPaths,
    newOutputPaths,
    oldGlobalConfigPath: path.join(oldGlobalDirectory, 'repofm.config.json'),
    newGlobalConfigPath: path.join(newGlobalDirectory, 'repofm.config.json'),
  };
};

/**
 * Migrate output files
 */
const migrateOutputFiles = async (oldPaths: string[], newPaths: string[]): Promise<string[]> => {
  const migratedFiles: string[] = [];

  for (let i = 0; i < oldPaths.length; i++) {
    const oldPath = oldPaths[i];
    const newPath = newPaths[i];
    const ext = path.extname(oldPath);

    if (await migrateFile(oldPath, newPath, `Output file (${ext})`)) {
      migratedFiles.push(newPath);
    }
  }

  return migratedFiles;
};

export const runMigrationAction = async (rootDir: string): Promise<MigrationResult> => {
  const result: MigrationResult = {
    configMigrated: false,
    ignoreMigrated: false,
    instructionMigrated: false,
    outputFilesMigrated: [],
    globalConfigMigrated: false,
  };

  try {
    const paths = getMigrationPaths(rootDir);

    // Check if migration is needed
    const hasOldConfig = await fileExists(paths.oldConfigPath);
    const hasOldIgnore = await fileExists(paths.oldIgnorePath);
    const hasOldInstruction = await fileExists(paths.oldInstructionPath);
    const hasOldGlobalConfig = await fileExists(paths.oldGlobalConfigPath);
    const hasOldOutput = await Promise.all(paths.oldOutputPaths.map(fileExists)).then((results) =>
      results.some((exists) => exists),
    );

    if (!hasOldConfig && !hasOldIgnore && !hasOldInstruction && !hasOldOutput && !hasOldGlobalConfig) {
      logger.debug('No Repofm files found to migrate.');
      return result;
    }

    // Show migration notice based on what needs to be migrated
    let migrationMessage = `Found ${pc.green('Repofm')} `;
    const items = [];
    if (hasOldConfig || hasOldIgnore || hasOldInstruction || hasOldOutput) items.push('local configuration');
    if (hasOldGlobalConfig) items.push('global configuration');
    migrationMessage += `${items.join(' and ')}. Would you like to migrate to ${pc.green('repofm')}?`;

    // Confirm migration with user
    const shouldMigrate = await prompts.confirm({
      message: migrationMessage,
    });

    if (prompts.isCancel(shouldMigrate) || !shouldMigrate) {
      logger.info('Migration cancelled.');
      return result;
    }

    // Show migration notice
    logger.info(pc.cyan('\nMigrating from Repofm to repofm...'));
    logger.log('');

    // Migrate config file
    if (hasOldConfig) {
      result.configMigrated = await migrateFile(paths.oldConfigPath, paths.newConfigPath, 'Configuration file', true);
    }

    // Migrate global config file
    if (hasOldGlobalConfig) {
      result.globalConfigMigrated = await migrateFile(
        paths.oldGlobalConfigPath,
        paths.newGlobalConfigPath,
        'Global configuration file',
        true,
      );
    }

    // Migrate ignore file
    if (hasOldIgnore) {
      result.ignoreMigrated = await migrateFile(paths.oldIgnorePath, paths.newIgnorePath, 'Ignore file');
    }

    // Migrate instruction file
    if (hasOldInstruction) {
      result.instructionMigrated = await migrateFile(
        paths.oldInstructionPath,
        paths.newInstructionPath,
        'Instruction file',
      );
    }

    // Migrate output files
    if (hasOldOutput) {
      result.outputFilesMigrated = await migrateOutputFiles(paths.oldOutputPaths, paths.newOutputPaths);
    }

    // Update content in gitignore and repofmignore
    await updateIgnoreFiles(rootDir);
    await updateGitignore(rootDir);

    // Show success message
    if (
      result.configMigrated ||
      result.ignoreMigrated ||
      result.instructionMigrated ||
      result.outputFilesMigrated.length > 0 ||
      result.globalConfigMigrated
    ) {
      logger.log('');
      logger.success('✔ Migration completed successfully!');
      logger.log('');
      logger.info(
        'You can now use repofm commands as usual. The old Repofm files have been migrated to the new format.',
      );
      logger.log('');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      result.error = error;
    } else {
      result.error = new Error(String(error));
    }
    logger.error('An error occurred during migration:', error);
    return result;
  }
};

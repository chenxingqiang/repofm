import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import pc from 'picocolors';
import { repofmError } from '../../shared/errorHandle.js';
import { logger } from '../../shared/logger.js';
import type { CliOptions } from '../cliRun.js';
import { CLISpinner as Spinner } from '../cliSpinner.js';
import { runDefaultAction } from './defaultAction.js';

const execAsync = promisify(exec);

export const runRemoteAction = async (repoUrl: string, options: CliOptions): Promise<void> => {
  const gitInstalled = await checkGitInstallation();
  if (!gitInstalled) {
    throw new repofmError('Git is not installed or not in the system PATH.');
  }

  const formattedUrl = formatGitUrl(repoUrl);
  const tempDir = await createTempDirectory();
  const spinner = new Spinner();
  spinner.start('Cloning repository...');

  try {
    await cloneRepository(formattedUrl, tempDir);
    spinner.succeed('Repository cloned successfully!');
    logger.info('');

    await runDefaultAction(
      tempDir,
      'repofm.config.json',
      {
        copyToClipboard: options.copy,
        outputPath: options.output,
        verbose: options.verbose,
        global: options.global
      }
    );
  } finally {
    // Clean up the temporary directory
    await cleanupTempDirectory(tempDir);
  }
};

export const formatGitUrl = (url: string): string => {
  // If the URL is in the format owner/repo, convert it to a GitHub URL
  if (/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(url)) {
    logger?.trace?.(`Formatting GitHub shorthand: ${url}`) ?? (() => {})();
    return `https://github.com/${url}.git`;
  }

  // Add .git to HTTPS URLs if missing
  if (url.startsWith('https://') && !url.endsWith('.git')) {
    logger?.trace?.(`Adding .git to HTTPS URL: ${url}`) ?? (() => {})();
    return `${url}.git`;
  }

  // If the URL already has .git or is an SSH URL, return it as-is
  return url;
};

const createTempDirectory = async (): Promise<string> => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repofm-'));
  logger.trace(`Created temporary directory. (path: ${pc.dim(tempDir)})`);
  return tempDir;
};

const cloneRepository = async (url: string, directory: string): Promise<void> => {
  logger.info(`Clone repository: ${url} to temporary directory. ${pc.dim(`path: ${directory}`)}`);
  logger.info('');

  try {
    await execAsync(`git clone --depth 1 ${url} ${directory}`);
  } catch (error) {
    throw new repofmError(`Failed to clone repository: ${(error as Error).message}`);
  }
};

const cleanupTempDirectory = async (directory: string): Promise<void> => {
  logger.trace(`Cleaning up temporary directory: ${directory}`);
  await fs.rm(directory, { recursive: true, force: true });
};

const checkGitInstallation = async (): Promise<boolean> => {
  try {
    const result = await execAsync('git --version');
    if (result.stderr) {
      return false;
    }
    return true;
  } catch (error) {
    logger.debug('Git is not installed:', (error as Error).message);
    return false;
  }
};

const copyOutputToCurrentDirectory = async (
  sourceDir: string,
  targetDir: string,
  outputFileName: string,
): Promise<void> => {
  const sourcePath = path.join(sourceDir, outputFileName);
  const targetPath = path.join(targetDir, outputFileName);

  try {
    logger.trace(`Copying output file from: ${sourcePath} to: ${targetPath}`);
    await fs.copyFile(sourcePath, targetPath);
  } catch (error) {
    throw new repofmError(`Failed to copy output file: ${(error as Error).message}`);
  }
};

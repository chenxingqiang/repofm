import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { logger } from '../../shared/logger.js';

export interface AutoCommitOptions {
  interactive?: boolean;
  message?: string;
}

export async function autoCommit(workingDir: string, options: AutoCommitOptions = {}): Promise<void> {
  const git = simpleGit(workingDir);
  const status = await git.status();

  if (status.modified.length === 0) {
    logger.info('No changes detected');
    return;
  }

  let commitMessage = options.message || 'Auto-commit: Changes detected';

  if (options.interactive) {
    const response = await inquirer.prompt([{
      type: 'input',
      name: 'message',
      message: 'Enter commit message:',
      default: commitMessage
    }]);
    commitMessage = response.message;
  }

  await git.add('.');
  await git.commit(commitMessage);
  logger.success(`Changes committed: ${commitMessage}`);
}

export default autoCommit;

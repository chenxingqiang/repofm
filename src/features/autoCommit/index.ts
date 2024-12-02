import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { repofmError } from '../../shared/errorHandle.js';

const execAsync = promisify(exec);

export interface AutoCommitOptions {
  message?: string;
  interactive?: boolean;
}

export async function performAutoCommit(options: AutoCommitOptions = {}) {
  try {
    if (options.interactive) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: 'Enter commit message:',
          default: options.message || 'Auto commit'
        }
      ]);
      options.message = answers.message;
    }

    await execAsync('git add .');
    await execAsync(`git commit -m "${options.message || 'Auto commit'}"`);
  } catch (error) {
    throw new repofmError(`Auto commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

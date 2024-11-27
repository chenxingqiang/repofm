import { GitService } from '../../services/GitService.js';
import { logger } from '../../shared/logger.js';
import { CliSpinner } from '../../cli/cliSpinner.js';

export interface AutoCommitOptions {
  message?: string;
  pattern?: string;
  push?: boolean;
  branch?: string;
  remote?: string;
  all?: boolean;
  interactive?: boolean;
}

export async function autoCommit(cwd: string, options: AutoCommitOptions): Promise<void> {
  const gitService = new GitService(cwd);
  const spinner = new CliSpinner();

  try {
    // Check if we're in a git repository
    spinner.start('Checking git repository');
    const isRepo = await gitService.isGitRepository();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }
    spinner.succeed();

    // Get current status
    spinner.start('Checking git status');
    const status = await gitService.getStatus();
    if (status.length === 0) {
      spinner.info('No changes to commit');
      return;
    }
    spinner.succeed();

    // Stage files
    if (options.interactive) {
      // TODO: Implement interactive staging
      throw new Error('Interactive mode not implemented yet');
    } else if (options.all) {
      spinner.start('Staging all files');
      await gitService.stageAll();
    } else if (options.pattern) {
      spinner.start(`Staging files matching pattern: ${options.pattern}`);
      await gitService.stageFiles(options.pattern);
    } else {
      throw new Error('Must specify --all or --pattern');
    }
    spinner.succeed();

    // Get staged files
    const stagedFiles = await gitService.getStagedFiles();
    if (stagedFiles.length === 0) {
      spinner.info('No files staged for commit');
      return;
    }

    // Generate or use commit message
    const commitMessage = options.message || await gitService.generateCommitMessage(stagedFiles);

    // Commit changes
    spinner.start('Creating commit');
    await gitService.commit(commitMessage);
    spinner.succeed(`Created commit: ${commitMessage}`);

    // Push if requested
    if (options.push) {
      const branch = options.branch || await gitService.getCurrentBranch();
      const remote = options.remote || 'origin';

      spinner.start(`Pushing to ${remote}/${branch}`);
      await gitService.push(remote, branch);
      spinner.succeed(`Pushed to ${remote}/${branch}`);
    }
  } catch (error) {
    spinner.fail(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

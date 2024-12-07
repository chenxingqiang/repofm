import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '../../shared/logger.js';
import { GitService } from '../../services/GitService.js';
const execAsync = promisify(exec);
export async function runAutocommitAction(targetDir, options = {}) {
    try {
        const gitService = new GitService(targetDir);
        // Check if we're in a git repository
        if (!await gitService.isGitRepository()) {
            throw new Error('Not a git repository');
        }
        // Get status of files
        const status = await gitService.getStatus();
        if (!status.length) {
            logger.info('No changes to commit');
            return;
        }
        // If all flag is set, stage all changes
        if (options.all) {
            await gitService.stageAll();
        }
        else if (options.pattern) {
            await gitService.stageFiles(options.pattern);
        }
        // Get staged files
        const stagedFiles = await gitService.getStagedFiles();
        if (!stagedFiles.length) {
            logger.info('No files staged for commit');
            return;
        }
        // Generate commit message if not provided
        const message = options.message || await gitService.generateCommitMessage(stagedFiles);
        // Create commit
        await gitService.commit(message);
        logger.info(`Created commit: ${message}`);
        // Push if requested
        if (options.push) {
            const remote = options.remote || 'origin';
            const branch = options.branch || await gitService.getCurrentBranch();
            await gitService.push(remote, branch);
            logger.info(`Pushed to ${remote}/${branch}`);
        }
    }
    catch (error) {
        logger.error('Error in autocommit action:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
//# sourceMappingURL=autocommitAction.js.map
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '../../shared/logger.js';
import { GitService } from '../../services/GitService.js';
import { AICommitGenerator } from '../../services/AICommitGenerator.js';
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
        // Stage files based on options
        if (options.all) {
            await gitService.stageAll();
        }
        else if (options.patterns && options.patterns.length > 0) {
            await gitService.stageFiles(options.patterns, options.excludePatterns, {
                ignoreCase: options.ignoreCase ?? true,
                dot: options.includeDotFiles ?? false,
                debug: options.debug ?? false
            });
        }
        // Get staged files
        const stagedFiles = await gitService.getStagedFiles();
        if (!stagedFiles.length) {
            logger.info('No files staged for commit');
            return;
        }
        // Generate commit message
        let commitMessage;
        if (options.message) {
            // Use provided message
            commitMessage = options.message;
        }
        else if (options.aiCommitMessage) {
            // Generate AI commit message
            commitMessage = await AICommitGenerator.generateCommitMessage({
                stagedFiles,
                maxLength: options.maxCommitLength ?? 72
            });
        }
        else {
            // Default commit message
            commitMessage = `Auto-commit: Staged ${stagedFiles.length} file(s)`;
        }
        // Perform commit
        await gitService.commit(commitMessage);
        logger.info(`Created commit: ${commitMessage}`);
        // Optional push
        if (options.push) {
            const branch = options.branch || 'main';
            const remote = options.remote || 'origin';
            await gitService.push(remote, branch);
            logger.info(`Pushed to ${remote}/${branch}`);
        }
    }
    catch (error) {
        logger.error('Autocommit failed:', error);
        throw error;
    }
}
//# sourceMappingURL=autocommitAction.js.map
import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { logger } from '../../shared/logger.js';
export async function autoCommit(workingDir, options = {}) {
    // simple-git's default export is callable under CJS interop; TypeScript NodeNext
    // resolves the type incorrectly so we suppress the error here.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error: simpleGit is callable at runtime
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
//# sourceMappingURL=index.js.map
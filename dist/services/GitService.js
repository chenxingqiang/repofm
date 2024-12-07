import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { logger } from '../shared/logger.js';
const execAsync = promisify(exec);
export class GitService {
    constructor(cwd) {
        this.cwd = path.resolve(cwd);
    }
    async isGitRepository() {
        try {
            await this.execGit('rev-parse --is-inside-work-tree');
            return true;
        }
        catch {
            return false;
        }
    }
    async getStatus() {
        const { stdout } = await this.execGit('status --porcelain');
        return stdout.split('\n')
            .filter(line => line.trim())
            .map(line => {
            const status = line.slice(0, 2).trim();
            const filePath = line.slice(3);
            return { path: filePath, status };
        });
    }
    async stageAll() {
        await this.execGit('add -A');
    }
    async stageFiles(pattern) {
        await this.execGit(`add ${pattern}`);
    }
    async getStagedFiles() {
        const { stdout } = await this.execGit('diff --name-only --cached');
        return stdout.split('\n').filter(line => line.trim());
    }
    async generateCommitMessage(files) {
        // Get the most common directory of changed files
        const commonDir = this.findCommonDirectory(files);
        // Get the type of changes
        const status = await this.getStatus();
        const types = new Set(status.map(s => this.getChangeType(s.status)));
        const changeType = Array.from(types).join(', ');
        // Generate message
        return `${changeType}${commonDir ? ` in ${commonDir}` : ''}: ${files.length} files`;
    }
    async commit(message) {
        await this.execGit(`commit -m "${message.replace(/"/g, '\\"')}"`);
    }
    async getCurrentBranch() {
        const { stdout } = await this.execGit('rev-parse --abbrev-ref HEAD');
        return stdout.trim();
    }
    async push(remote, branch) {
        await this.execGit(`push ${remote} ${branch}`);
    }
    async execGit(command) {
        try {
            const result = await execAsync(`git ${command}`, { cwd: this.cwd });
            return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
        }
        catch (error) {
            if (error instanceof Error) {
                logger.error('Git command failed:', error.message);
                throw new Error(`Git command failed: ${error.message}`);
            }
            throw error;
        }
    }
    findCommonDirectory(files) {
        if (!files.length)
            return '';
        const parts = files[0].split('/');
        let commonDir = '';
        for (let i = 0; i < parts.length - 1; i++) {
            const dir = parts.slice(0, i + 1).join('/');
            if (files.every(f => f.startsWith(dir + '/'))) {
                commonDir = dir;
            }
            else {
                break;
            }
        }
        return commonDir;
    }
    getChangeType(status) {
        switch (status) {
            case 'A':
                return 'add';
            case 'M':
                return 'update';
            case 'D':
                return 'delete';
            case 'R':
                return 'rename';
            case '??':
                return 'add';
            default:
                return 'update';
        }
    }
}
//# sourceMappingURL=GitService.js.map
import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { logger } from '../shared/logger.js';
import { minimatch } from 'minimatch.js';
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
    /**
     * Advanced file staging with comprehensive pattern matching
     * @param includePatterns Glob patterns to include
     * @param excludePatterns Glob patterns to exclude
     * @param options Additional options for fine-tuned matching
     */
    async stageFiles(includePatterns, excludePatterns = [], options = {}) {
        // Normalize options
        const { ignoreCase = true, dot = false, debug = false } = options;
        try {
            // Get all tracked and untracked files
            const { stdout: allFilesOutput } = await this.execGit('ls-files --modified --others --exclude-standard');
            // Split and clean file list
            const allFiles = allFilesOutput.trim().split('\n').filter(Boolean);
            // Filter files based on include and exclude patterns
            const matchedFiles = allFiles.filter(file => {
                // Normalize file path to be relative to project root
                const relativePath = path.relative(this.cwd, path.resolve(this.cwd, file));
                // Check include patterns
                const matchesInclude = includePatterns.length === 0 ||
                    includePatterns.some(pattern => minimatch(relativePath, pattern, {
                        matchBase: true,
                        nocase: ignoreCase,
                        dot
                    }));
                // Check exclude patterns
                const matchesExclude = excludePatterns.some(pattern => minimatch(relativePath, pattern, {
                    matchBase: true,
                    nocase: ignoreCase,
                    dot
                }));
                // Debug logging if enabled
                if (debug) {
                    console.log(`File: ${file}`);
                    console.log(`Relative Path: ${relativePath}`);
                    console.log(`Matches Include: ${matchesInclude}`);
                    console.log(`Matches Exclude: ${matchesExclude}`);
                    console.log('---');
                }
                // Final file selection logic
                return matchesInclude && !matchesExclude;
            });
            // Log matched files if in debug mode
            if (debug) {
                console.log('Matched Files:', matchedFiles);
            }
            // Stage matched files
            if (matchedFiles.length > 0) {
                const stagedFiles = matchedFiles.map(f => `"${f}"`).join(' ');
                await this.execGit(`add ${stagedFiles}`);
                // Optional: Log staged files
                if (debug) {
                    console.log('Staged Files:', matchedFiles);
                }
            }
            else {
                // Provide informative message when no files match
                console.log('No files matched the specified patterns.');
            }
        }
        catch (error) {
            // Enhanced error handling
            console.error('Error in advanced file staging:', error);
            throw new Error(`Failed to stage files: ${error instanceof Error ? error.message : String(error)}`);
        }
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

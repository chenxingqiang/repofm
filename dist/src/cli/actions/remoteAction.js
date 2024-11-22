var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import pc from 'picocolors';
import { repofmError } from '../../shared/errorHandle.js';
import { logger } from '../../shared/logger.js';
import Spinner from '../cliSpinner.js';
import { runDefaultAction } from './defaultAction.js';
const execAsync = promisify(exec);
export const runRemoteAction = (repoUrl, options) => __awaiter(void 0, void 0, void 0, function* () {
    const gitInstalled = yield checkGitInstallation();
    if (!gitInstalled) {
        throw new repofmError('Git is not installed or not in the system PATH.');
    }
    const formattedUrl = formatGitUrl(repoUrl);
    const tempDir = yield createTempDirectory();
    const spinner = new Spinner('Cloning repository...');
    try {
        spinner.start();
        yield cloneRepository(formattedUrl, tempDir);
        spinner.succeed('Repository cloned successfully!');
        logger.log('');
        yield runDefaultAction({
            cwd: tempDir,
            config: {
                include: ['**/*'],
                ignore: {
                    customPatterns: [],
                    useDefaultPatterns: true,
                    useGitignore: true
                },
                output: {
                    filePath: options.output || 'repofm-output.txt',
                    style: options.style || 'plain',
                    removeComments: false,
                    removeEmptyLines: false,
                    showLineNumbers: options.outputShowLineNumbers || false,
                    copyToClipboard: options.copy || false,
                    topFilesLength: options.topFilesLen || 10
                },
                security: {
                    enableSecurityCheck: true
                }
            }
        });
    }
    finally {
        // Clean up the temporary directory
        yield cleanupTempDirectory(tempDir);
    }
});
export const formatGitUrl = (url) => {
    // If the URL is in the format owner/repo, convert it to a GitHub URL
    if (/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(url)) {
        logger.trace(`Formatting GitHub shorthand: ${url}`);
        return `https://github.com/${url}.git`;
    }
    // Add .git to HTTPS URLs if missing
    if (url.startsWith('https://') && !url.endsWith('.git')) {
        logger.trace(`Adding .git to HTTPS URL: ${url}`);
        return `${url}.git`;
    }
    return url;
};
const createTempDirectory = () => __awaiter(void 0, void 0, void 0, function* () {
    const tempDir = yield fs.mkdtemp(path.join(os.tmpdir(), 'repofm-'));
    logger.trace(`Created temporary directory. (path: ${pc.dim(tempDir)})`);
    return tempDir;
});
const cloneRepository = (url, directory) => __awaiter(void 0, void 0, void 0, function* () {
    logger.log(`Clone repository: ${url} to temporary directory. ${pc.dim(`path: ${directory}`)}`);
    logger.log('');
    try {
        yield execAsync(`git clone --depth 1 ${url} ${directory}`);
    }
    catch (error) {
        throw new repofmError(`Failed to clone repository: ${error.message}`);
    }
});
const cleanupTempDirectory = (directory) => __awaiter(void 0, void 0, void 0, function* () {
    logger.trace(`Cleaning up temporary directory: ${directory}`);
    yield fs.rm(directory, { recursive: true, force: true });
});
const checkGitInstallation = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield execAsync('git --version');
        if (result.stderr) {
            return false;
        }
        return true;
    }
    catch (error) {
        logger.debug('Git is not installed:', error.message);
        return false;
    }
});
const copyOutputToCurrentDirectory = (sourceDir, targetDir, outputFileName) => __awaiter(void 0, void 0, void 0, function* () {
    const sourcePath = path.join(sourceDir, outputFileName);
    const targetPath = path.join(targetDir, outputFileName);
    try {
        logger.trace(`Copying output file from: ${sourcePath} to: ${targetPath}`);
        yield fs.copyFile(sourcePath, targetPath);
    }
    catch (error) {
        throw new repofmError(`Failed to copy output file: ${error.message}`);
    }
});
//# sourceMappingURL=remoteAction.js.map
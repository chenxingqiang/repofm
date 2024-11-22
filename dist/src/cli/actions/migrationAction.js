var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import pc from 'picocolors';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';
/**
 * Check if a file exists at the given path
 */
const fileExists = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs.access(filePath);
        return true;
    }
    catch (_a) {
        return false;
    }
});
/**
 * Replace all occurrences of 'repofm' with 'repofm' in a string
 */
const replaceRepofmString = (content) => {
    if (!content.includes('repofm') && !content.includes('Repofm')) {
        return content;
    }
    let result = content;
    if (content.includes('repofm')) {
        result = result.replace(/repofm/g, 'repofm');
    }
    if (content.includes('Repofm')) {
        result = result.replace(/Repofm/g, 'repofm');
    }
    return result;
};
/**
 * Update file content by replacing 'repofm' with 'repofm'
 */
const updateFileContent = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield fs.readFile(filePath, 'utf8');
    const updatedContent = replaceRepofmString(content);
    // Check if content needs to be updated
    if (content !== updatedContent) {
        yield fs.writeFile(filePath, updatedContent, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        logger.log(`Updated repofm references in ${pc.cyan(relativePath)}`);
        return true;
    }
    return false;
});
/**
 * Parse JSON content, update instructionFilePath if exists
 */
const updateInstructionPath = (content) => {
    var _a, _b;
    try {
        const config = JSON.parse(content);
        if ((_a = config.output) === null || _a === void 0 ? void 0 : _a.instructionFilePath) {
            config.output.instructionFilePath = config.output.instructionFilePath.replace('repofm', 'repofm');
        }
        // Also update output.filePath if it exists
        if ((_b = config.output) === null || _b === void 0 ? void 0 : _b.filePath) {
            config.output.filePath = config.output.filePath.replace('repofm', 'repofm');
        }
        return JSON.stringify(config, null, 2);
    }
    catch (_c) {
        return content;
    }
};
/**
 * Get output file paths pairs
 */
const getOutputFilePaths = (rootDir) => {
    const extensions = ['.txt', '.xml', '.md'];
    const oldPaths = extensions.map((ext) => path.join(rootDir, `repofm-output${ext}`));
    const newPaths = extensions.map((ext) => path.join(rootDir, `repofm-output${ext}`));
    return { oldPaths, newPaths };
};
/**
 * Migrate a single file from old path to new path
 */
const migrateFile = (oldPath_1, newPath_1, description_1, ...args_1) => __awaiter(void 0, [oldPath_1, newPath_1, description_1, ...args_1], void 0, function* (oldPath, newPath, description, isConfig = false) {
    if (!(yield fileExists(oldPath))) {
        return false;
    }
    const exists = yield fileExists(newPath);
    if (exists) {
        const shouldOverwrite = yield prompts.confirm({
            message: `${description} already exists at ${newPath}. Do you want to overwrite it?`,
        });
        if (prompts.isCancel(shouldOverwrite) || !shouldOverwrite) {
            logger.info(`Skipping migration of ${description}`);
            return false;
        }
    }
    try {
        // Read and update content
        let content = yield fs.readFile(oldPath, 'utf8');
        content = replaceRepofmString(content);
        // For config files, also update instructionFilePath and output.filePath
        if (isConfig) {
            content = updateInstructionPath(content);
        }
        // Ensure the target directory exists
        yield fs.mkdir(path.dirname(newPath), { recursive: true });
        // Write to new file
        yield fs.writeFile(newPath, content, 'utf8');
        // Remove old file
        yield fs.unlink(oldPath);
        const relativeOldPath = path.relative(process.cwd(), oldPath);
        const relativeNewPath = path.relative(process.cwd(), newPath);
        logger.log(`Renamed ${description} from ${relativeOldPath} to ${relativeNewPath}`);
        return true;
    }
    catch (error) {
        logger.error(`Failed to migrate ${description}:`, error);
        return false;
    }
});
/**
 * Update content of gitignore and repofmignore files
 */
const updateIgnoreFiles = (rootDir) => __awaiter(void 0, void 0, void 0, function* () {
    const gitignorePath = path.join(rootDir, '.gitignore');
    const repofmignorePath = path.join(rootDir, '.repofmignore');
    if (yield fileExists(gitignorePath)) {
        const updated = yield updateFileContent(gitignorePath);
        if (!updated) {
            logger.debug('No changes needed in .gitignore');
        }
    }
    if (yield fileExists(repofmignorePath)) {
        const updated = yield updateFileContent(repofmignorePath);
        if (!updated) {
            logger.debug('No changes needed in .repofmignore');
        }
    }
});
/**
 * Get all migration related file paths
 */
const getMigrationPaths = (rootDir) => {
    const { oldPaths: oldOutputPaths, newPaths: newOutputPaths } = getOutputFilePaths(rootDir);
    const oldGlobalDirectory = path.join(process.env.HOME || '', '.config', 'repofm');
    const newGlobalDirectory = getGlobalDirectory();
    return {
        oldConfigPath: path.join(rootDir, 'repofm.config.json'),
        newConfigPath: path.join(rootDir, 'repofm.config.json'),
        oldIgnorePath: path.join(rootDir, '.repofmignore'),
        newIgnorePath: path.join(rootDir, '.repofmignore'),
        oldInstructionPath: path.join(rootDir, 'repofm-instruction.md'),
        newInstructionPath: path.join(rootDir, 'repofm-instruction.md'),
        oldOutputPaths,
        newOutputPaths,
        oldGlobalConfigPath: path.join(oldGlobalDirectory, 'repofm.config.json'),
        newGlobalConfigPath: path.join(newGlobalDirectory, 'repofm.config.json'),
    };
};
/**
 * Migrate output files
 */
const migrateOutputFiles = (oldPaths, newPaths) => __awaiter(void 0, void 0, void 0, function* () {
    const migratedFiles = [];
    for (let i = 0; i < oldPaths.length; i++) {
        const oldPath = oldPaths[i];
        const newPath = newPaths[i];
        const ext = path.extname(oldPath);
        if (yield migrateFile(oldPath, newPath, `Output file (${ext})`)) {
            migratedFiles.push(newPath);
        }
    }
    return migratedFiles;
});
export const runMigrationAction = (rootDir) => __awaiter(void 0, void 0, void 0, function* () {
    const result = {
        configMigrated: false,
        ignoreMigrated: false,
        instructionMigrated: false,
        outputFilesMigrated: [],
        globalConfigMigrated: false,
    };
    try {
        const paths = getMigrationPaths(rootDir);
        // Check if migration is needed
        const hasOldConfig = yield fileExists(paths.oldConfigPath);
        const hasOldIgnore = yield fileExists(paths.oldIgnorePath);
        const hasOldInstruction = yield fileExists(paths.oldInstructionPath);
        const hasOldGlobalConfig = yield fileExists(paths.oldGlobalConfigPath);
        const hasOldOutput = yield Promise.all(paths.oldOutputPaths.map(fileExists)).then((results) => results.some((exists) => exists));
        if (!hasOldConfig && !hasOldIgnore && !hasOldInstruction && !hasOldOutput && !hasOldGlobalConfig) {
            logger.debug('No Repofm files found to migrate.');
            return result;
        }
        // Show migration notice based on what needs to be migrated
        let migrationMessage = `Found ${pc.green('Repofm')} `;
        const items = [];
        if (hasOldConfig || hasOldIgnore || hasOldInstruction || hasOldOutput)
            items.push('local configuration');
        if (hasOldGlobalConfig)
            items.push('global configuration');
        migrationMessage += `${items.join(' and ')}. Would you like to migrate to ${pc.green('repofm')}?`;
        // Confirm migration with user
        const shouldMigrate = yield prompts.confirm({
            message: migrationMessage,
        });
        if (prompts.isCancel(shouldMigrate) || !shouldMigrate) {
            logger.info('Migration cancelled.');
            return result;
        }
        // Show migration notice
        logger.info(pc.cyan('\nMigrating from Repofm to repofm...'));
        logger.log('');
        // Migrate config file
        if (hasOldConfig) {
            result.configMigrated = yield migrateFile(paths.oldConfigPath, paths.newConfigPath, 'Configuration file', true);
        }
        // Migrate global config file
        if (hasOldGlobalConfig) {
            result.globalConfigMigrated = yield migrateFile(paths.oldGlobalConfigPath, paths.newGlobalConfigPath, 'Global configuration file', true);
        }
        // Migrate ignore file
        if (hasOldIgnore) {
            result.ignoreMigrated = yield migrateFile(paths.oldIgnorePath, paths.newIgnorePath, 'Ignore file');
        }
        // Migrate instruction file
        if (hasOldInstruction) {
            result.instructionMigrated = yield migrateFile(paths.oldInstructionPath, paths.newInstructionPath, 'Instruction file');
        }
        // Migrate output files
        if (hasOldOutput) {
            result.outputFilesMigrated = yield migrateOutputFiles(paths.oldOutputPaths, paths.newOutputPaths);
        }
        // Update content in gitignore and repofmignore
        yield updateIgnoreFiles(rootDir);
        // Show success message
        if (result.configMigrated ||
            result.ignoreMigrated ||
            result.instructionMigrated ||
            result.outputFilesMigrated.length > 0 ||
            result.globalConfigMigrated) {
            logger.log('');
            logger.success('✔ Migration completed successfully!');
            logger.log('');
            logger.info('You can now use repofm commands as usual. The old Repofm files have been migrated to the new format.');
            logger.log('');
        }
        return result;
    }
    catch (error) {
        if (error instanceof Error) {
            result.error = error;
        }
        else {
            result.error = new Error(String(error));
        }
        logger.error('An error occurred during migration:', error);
        return result;
    }
});
//# sourceMappingURL=migrationAction.js.map
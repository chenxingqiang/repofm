var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import pc from 'picocolors';
import { defaultConfig, defaultFilePathMap, } from '../../config/configSchema.js';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';
const onCancelOperation = () => {
    prompts.cancel('Initialization cancelled.');
    process.exit(0);
};
export const runInitAction = (rootDir, isGlobal) => __awaiter(void 0, void 0, void 0, function* () {
    prompts.intro(pc.bold(`Welcome to repofm ${isGlobal ? 'Global ' : ''}Configuration!`));
    try {
        // Step 1: Ask if user wants to create a config file
        const isCreatedConfig = yield createConfigFile(rootDir, isGlobal);
        // Step 2: Ask if user wants to create a .repofmignore file
        const isCreatedIgnoreFile = yield createIgnoreFile(rootDir, isGlobal);
        if (!isCreatedConfig && !isCreatedIgnoreFile) {
            prompts.outro(pc.yellow('No files were created. You can run this command again when you need to create configuration files.'));
        }
        else {
            prompts.outro(pc.green('Initialization complete! You can now use repofm with your specified settings.'));
        }
    }
    catch (error) {
        logger.error('An error occurred during initialization:', error);
    }
});
export function createConfigFile(rootDir, isGlobal) {
    return __awaiter(this, void 0, void 0, function* () {
        const isCancelled = false;
        const configPath = isGlobal
            ? path.resolve(getGlobalDirectory(), 'repofm.config.json')
            : path.resolve(rootDir, 'repofm.config.json');
        const isCreateConfig = yield prompts.confirm({
            message: `Do you want to create a ${isGlobal ? 'global ' : ''}${pc.green('repofm.config.json')} file?`,
        });
        if (!isCreateConfig) {
            prompts.log.info(`Skipping ${pc.green('repofm.config.json')} file creation.`);
            return false;
        }
        if (prompts.isCancel(isCreateConfig)) {
            onCancelOperation();
            return false;
        }
        let isConfigFileExists = false;
        try {
            yield fs.access(configPath);
            isConfigFileExists = true;
        }
        catch (_a) {
            // File doesn't exist, so we can proceed
        }
        if (isConfigFileExists) {
            const isOverwrite = yield prompts.confirm({
                message: `A ${isGlobal ? 'global ' : ''}${pc.green('repofm.config.json')} file already exists. Do you want to overwrite it?`,
            });
            if (!isOverwrite) {
                prompts.log.info(`Skipping ${pc.green('repofm.config.json')} file creation.`);
                return false;
            }
            if (prompts.isCancel(isOverwrite)) {
                onCancelOperation();
                return false;
            }
        }
        const options = yield prompts.group({
            outputStyle: () => {
                if (isCancelled) {
                    return;
                }
                return prompts.select({
                    message: 'Output style:',
                    options: [
                        { value: 'plain', label: 'Plain', hint: 'Simple text format' },
                        { value: 'xml', label: 'XML', hint: 'Structured XML format' },
                        { value: 'markdown', label: 'Markdown', hint: 'Markdown format' },
                    ],
                    initialValue: defaultConfig.output.style,
                });
            },
            outputFilePath: ({ results }) => {
                if (isCancelled) {
                    return;
                }
                const defaultFilePath = defaultFilePathMap[results.outputStyle];
                return prompts.text({
                    message: 'Output file path:',
                    initialValue: defaultFilePath,
                    validate: (value) => (value.length === 0 ? 'Output file path is required' : undefined),
                });
            },
        }, {
            onCancel: onCancelOperation,
        });
        const config = Object.assign(Object.assign({}, defaultConfig), { output: Object.assign(Object.assign({}, defaultConfig.output), { filePath: options.outputFilePath, style: options.outputStyle }) });
        yield fs.mkdir(path.dirname(configPath), { recursive: true });
        yield fs.writeFile(configPath, JSON.stringify(config, null, 2));
        const relativeConfigPath = path.relative(rootDir, configPath);
        prompts.log.success(pc.green(`${isGlobal ? 'Global config' : 'Config'} file created!\n`) + pc.dim(`Path: ${relativeConfigPath}`));
        return true;
    });
}
export function createIgnoreFile(rootDir, isGlobal) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isGlobal) {
            prompts.log.info(`Skipping ${pc.green('.repofmignore')} file creation for global configuration.`);
            return false;
        }
        const ignorePath = path.resolve(rootDir, '.repofmignore');
        const createIgnore = yield prompts.confirm({
            message: `Do you want to create a ${pc.green('.repofmignore')} file?`,
        });
        if (!createIgnore) {
            prompts.log.info(`Skipping ${pc.green('.repofmignore')} file creation.`);
            return false;
        }
        if (prompts.isCancel(createIgnore)) {
            onCancelOperation();
            return false;
        }
        let isIgnoreFileExists = false;
        try {
            yield fs.access(ignorePath);
            isIgnoreFileExists = true;
        }
        catch (_a) {
            // File doesn't exist, so we can proceed
        }
        if (isIgnoreFileExists) {
            const overwrite = yield prompts.confirm({
                message: `A ${pc.green('.repofmignore')} file already exists. Do you want to overwrite it?`,
            });
            if (!overwrite) {
                prompts.log.info(`${pc.green('.repofmignore')} file creation skipped. Existing file will not be modified.`);
                return false;
            }
        }
        const defaultIgnoreContent = `# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
`;
        yield fs.writeFile(ignorePath, defaultIgnoreContent);
        prompts.log.success(pc.green('Created .repofmignore file!\n') + pc.dim(`Path: ${path.relative(rootDir, ignorePath)}`));
        return true;
    });
}
//# sourceMappingURL=initAction.js.map
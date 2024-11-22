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
import { repofmError, rethrowValidationErrorIfZodError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import { defaultConfig, defaultFilePathMap, repofmConfigFileSchema, repofmConfigMergedSchema, } from './configSchema.js';
import { getGlobalDirectory } from './globalDirectory.js';
const defaultConfigPath = 'repofm.config.json';
const getGlobalConfigPath = () => {
    return path.join(getGlobalDirectory(), 'repofm.config.json');
};
export const loadFileConfig = (rootDir, argConfigPath) => __awaiter(void 0, void 0, void 0, function* () {
    let useDefaultConfig = false;
    let configPath = argConfigPath;
    if (!configPath) {
        useDefaultConfig = true;
        configPath = defaultConfigPath;
    }
    const fullPath = path.resolve(rootDir, configPath);
    logger.trace('Loading local config from:', fullPath);
    // Check local file existence
    const isLocalFileExists = yield fs
        .stat(fullPath)
        .then((stats) => stats.isFile())
        .catch(() => false);
    if (isLocalFileExists) {
        return yield loadAndValidateConfig(fullPath);
    }
    if (useDefaultConfig) {
        // Try to load global config
        const globalConfigPath = getGlobalConfigPath();
        logger.trace('Loading global config from:', globalConfigPath);
        const isGlobalFileExists = yield fs
            .stat(globalConfigPath)
            .then((stats) => stats.isFile())
            .catch(() => false);
        if (isGlobalFileExists) {
            return yield loadAndValidateConfig(globalConfigPath);
        }
        logger.note(`No custom config found at ${configPath} or global config at ${globalConfigPath}.\nYou can add a config file for additional settings. Please check https://github.com/chenxingqiang/repofm for more information.`);
        return {};
    }
    throw new repofmError(`Config file not found at ${configPath}`);
});
const loadAndValidateConfig = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileContent = yield fs.readFile(filePath, 'utf-8');
        const config = JSON.parse(fileContent);
        return repofmConfigFileSchema.parse(config);
    }
    catch (error) {
        rethrowValidationErrorIfZodError(error, 'Invalid config schema');
        if (error instanceof SyntaxError) {
            throw new repofmError(`Invalid JSON in config file ${filePath}: ${error.message}`);
        }
        if (error instanceof Error) {
            throw new repofmError(`Error loading config from ${filePath}: ${error.message}`);
        }
        throw new repofmError(`Error loading config from ${filePath}`);
    }
});
export const mergeConfigs = (cwd, fileConfig, cliConfig) => {
    var _a, _b, _c, _d, _e, _f;
    logger.trace('Default config:', defaultConfig);
    const baseConfig = defaultConfig;
    // If the output file path is not provided in the config file or CLI, use the default file path for the style
    if (((_a = cliConfig.output) === null || _a === void 0 ? void 0 : _a.filePath) == null && ((_b = fileConfig.output) === null || _b === void 0 ? void 0 : _b.filePath) == null) {
        const style = ((_c = cliConfig.output) === null || _c === void 0 ? void 0 : _c.style) || ((_d = fileConfig.output) === null || _d === void 0 ? void 0 : _d.style) || baseConfig.output.style;
        baseConfig.output.filePath = defaultFilePathMap[style];
        logger.trace('Default output file path is set to:', baseConfig.output.filePath);
    }
    const mergedConfig = {
        cwd,
        output: Object.assign(Object.assign(Object.assign({}, baseConfig.output), fileConfig.output), cliConfig.output),
        include: [...(baseConfig.include || []), ...(fileConfig.include || []), ...(cliConfig.include || [])],
        ignore: Object.assign(Object.assign(Object.assign(Object.assign({}, baseConfig.ignore), fileConfig.ignore), cliConfig.ignore), { customPatterns: [
                ...(baseConfig.ignore.customPatterns || []),
                ...(((_e = fileConfig.ignore) === null || _e === void 0 ? void 0 : _e.customPatterns) || []),
                ...(((_f = cliConfig.ignore) === null || _f === void 0 ? void 0 : _f.customPatterns) || []),
            ] }),
        security: Object.assign(Object.assign(Object.assign({}, baseConfig.security), fileConfig.security), cliConfig.security),
    };
    try {
        return repofmConfigMergedSchema.parse(mergedConfig);
    }
    catch (error) {
        rethrowValidationErrorIfZodError(error, 'Invalid merged config');
        throw error;
    }
};
//# sourceMappingURL=configLoad.js.map
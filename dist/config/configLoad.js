import * as fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod.js';
import { logger } from '../shared/logger.js';
import { getGlobalDirectory } from './globalDirectory.js';
const defaultFilePathMap = {
    plain: 'output.txt',
    xml: 'output.xml',
    markdown: 'output.md'
};
export function createDefaultConfig(cwd, options = {}) {
    return {
        output: {
            filePath: options.output || defaultFilePathMap.plain,
            style: 'plain',
            removeComments: false,
            removeEmptyLines: false,
            topFilesLength: 10,
            showLineNumbers: false,
            copyToClipboard: options.copy || false,
            headerText: 'Repository Content',
            instructionFilePath: ''
        },
        include: options.include || [],
        ignore: {
            customPatterns: options.ignore?.customPatterns || [],
            useDefaultPatterns: true,
            useGitignore: true,
            excludePatterns: ['node_modules/**', '.git/**']
        },
        security: {
            enableSecurityCheck: options.security || false
        },
        cwd
    };
}
const outputSchema = z.object({
    filePath: z.string().optional(),
    style: z.enum(['plain', 'xml', 'markdown']).optional(),
    removeComments: z.boolean().optional(),
    removeEmptyLines: z.boolean().optional(),
    topFilesLength: z.number().optional(),
    showLineNumbers: z.boolean().optional(),
    copyToClipboard: z.boolean().optional(),
    headerText: z.string().optional(),
    instructionFilePath: z.string().optional()
}).strict().optional();
const configSchema = z.object({
    output: outputSchema,
    include: z.array(z.string()).optional(),
    ignore: z.object({
        customPatterns: z.array(z.string()).optional(),
        useDefaultPatterns: z.boolean().optional(),
        useGitignore: z.boolean().optional(),
        excludePatterns: z.array(z.string()).optional()
    }).strict().optional(),
    security: z.object({
        enableSecurityCheck: z.boolean().optional()
    }).strict().optional(),
    cwd: z.string().optional()
}).strict();
export async function loadFileConfig(cwd, configFile = null) {
    try {
        // Try local config first
        const localConfigPath = configFile || path.join(cwd, 'repofm.config.json');
        try {
            await fs.stat(localConfigPath);
            const configContent = await fs.readFile(localConfigPath, 'utf-8');
            // Explicitly parse JSON and validate
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(configContent);
            }
            catch (error) {
                // Malformed JSON
                return {};
            }
            // Validate config schema
            try {
                configSchema.parse(parsedConfig);
                return parsedConfig;
            }
            catch (validationError) {
                // Invalid config structure
                return {};
            }
        }
        catch (localError) {
            // If local config not found or invalid, try global config
            const globalDir = getGlobalDirectory();
            const globalConfigPath = path.join(globalDir, 'repofm.config.json');
            try {
                await fs.stat(globalConfigPath);
                const configContent = await fs.readFile(globalConfigPath, 'utf-8');
                const parsedConfig = JSON.parse(configContent);
                try {
                    configSchema.parse(parsedConfig);
                    return parsedConfig;
                }
                catch (validationError) {
                    // Invalid config structure
                    return {};
                }
            }
            catch (globalError) {
                // No config found, return empty object
                logger.info('No custom config found, using defaults');
                return {};
            }
        }
    }
    catch (error) {
        // Catch any unexpected errors
        logger.error('Unexpected error loading config:', error);
        return {};
    }
}
export function mergeConfigs(cwd, fileConfig = {}, cliConfig = {}) {
    // Validate configs before merging
    const defaultConfig = createDefaultConfig(cwd);
    // Validate file config if provided
    if (Object.keys(fileConfig).length > 0) {
        try {
            configSchema.parse(fileConfig);
        }
        catch (error) {
            throw error;
        }
    }
    return {
        ...defaultConfig,
        ...fileConfig,
        cwd,
        output: {
            ...defaultConfig.output,
            ...fileConfig.output,
            ...(typeof cliConfig.output === 'string' ? { filePath: cliConfig.output } : {}),
            copyToClipboard: cliConfig.copy ?? fileConfig.output?.copyToClipboard ?? defaultConfig.output.copyToClipboard
        },
        security: {
            ...defaultConfig.security,
            ...fileConfig.security,
            enableSecurityCheck: cliConfig.security ?? fileConfig.security?.enableSecurityCheck ?? defaultConfig.security.enableSecurityCheck
        }
    };
}
export async function loadConfig(cwd, options = {}) {
    try {
        logger.debug(`Loading config - CWD: ${cwd}, Global: ${options.global}`);
        const globalConfigPath = path.join(await getGlobalDirectory(), 'repofm.config.json');
        logger.debug(`Global config path: ${globalConfigPath}`);
        const localConfigPath = path.join(cwd, 'repofm.config.json');
        logger.debug(`Local config path: ${localConfigPath}`);
        const fileConfig = await loadFileConfig(cwd, options.global ? globalConfigPath : localConfigPath);
        logger.debug('Loaded file config:', JSON.stringify(fileConfig, null, 2));
        const defaultConfig = createDefaultConfig(cwd);
        const mergedConfig = mergeConfigs(cwd, fileConfig);
        logger.debug('Merged config:', JSON.stringify(mergedConfig, null, 2));
        return mergedConfig;
    }
    catch (error) {
        logger.error('Error loading config:', error);
        throw error;
    }
}

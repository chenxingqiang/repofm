import { pack } from '../../core/packager.js';
import { loadConfig, createDefaultConfig } from '../../config/configLoad.js';
function createDefaultDependencies() {
    return {
        include: [],
        ignore: {
            customPatterns: [],
            useDefaultPatterns: true,
            useGitignore: true,
            excludePatterns: ['node_modules/**', '.git/**']
        }
    };
}
export async function runDefaultAction(currentCwd, options = {}) {
    try {
        const loadedConfig = await loadConfig(currentCwd);
        const defaultConfig = createDefaultConfig(currentCwd);
        const dependencies = createDefaultDependencies();
        const finalConfig = {
            ...defaultConfig,
            ...loadedConfig,
            ...dependencies,
            cwd: currentCwd,
            output: {
                ...defaultConfig.output,
                ...loadedConfig.output,
                ...(typeof options.output === 'string' ? { filePath: options.output } : {}),
                copyToClipboard: options.copy ?? loadedConfig.output?.copyToClipboard ?? defaultConfig.output.copyToClipboard
            },
            security: {
                ...defaultConfig.security,
                ...loadedConfig.security,
                enableSecurityCheck: options.security ?? loadedConfig.security?.enableSecurityCheck ?? defaultConfig.security.enableSecurityCheck
            },
            include: loadedConfig.include || dependencies.include,
            ignore: {
                ...dependencies.ignore,
                ...loadedConfig.ignore,
            }
        };
        const result = await pack(currentCwd, finalConfig);
        return result.totalFiles > 0;
    }
    catch (error) {
        console.error('Error in default action:', error);
        return false;
    }
}

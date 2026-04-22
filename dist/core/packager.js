import path from 'path';
import { findFiles } from './file/fileSearch.js';
import { collectFilesInfo } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { OutputGenerator } from './outputGenerator.js';
import { runSecurityCheck } from './security/securityCheck.js';
export function generateOutput(options) {
    const { data, ...outputOptions } = options;
    const generator = new OutputGenerator(outputOptions);
    return generator.generate(data);
}
export const defaultDeps = {
    searchFiles: findFiles,
    collectFiles: collectFilesInfo,
    processFiles,
    runSecurityCheck,
    generateOutput,
};
export async function pack(directory, config, deps = defaultDeps) {
    try {
        const files = await deps.searchFiles(directory, ['**/*'], {
            ignore: {
                patterns: config.ignore.excludePatterns || [],
                useGitignore: config.ignore.useGitignore,
                useDefaultPatterns: config.ignore.useDefaultPatterns,
            }
        });
        const collected = await deps.collectFiles(files.map(f => path.join(directory, f)));
        const processed = await deps.processFiles(collected);
        // Optional security check
        const securityChecked = config.security.enableSecurityCheck
            ? await deps.runSecurityCheck(processed.map(file => ({
                path: file.path,
                content: file.content,
                size: file.size || 0
            })))
            : processed;
        // Generate output  
        const output = deps.generateOutput({
            data: securityChecked,
            format: config.output.style === 'plain' || config.output.style === 'xml' ? 'text' : 'markdown',
            pretty: true
        });
        return {
            totalFiles: securityChecked.length,
            fileCharCounts: securityChecked.reduce((acc, file) => {
                if ('content' in file && 'path' in file) {
                    acc[file.path] = file.content.length;
                }
                return acc;
            }, {}),
            output
        };
    }
    catch (error) {
        console.error('Error during file processing:', error);
        throw error;
    }
}
export { processFiles, runSecurityCheck, };
//# sourceMappingURL=packager.js.map
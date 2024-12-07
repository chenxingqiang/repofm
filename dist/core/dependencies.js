import { searchFiles } from './file/fileSearch.js';
import { collectFiles } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { generateOutput } from './packager.js';
import { runSecurityCheck } from './security/securityCheck.js';
export const defaultDeps = {
    searchFiles,
    collectFiles,
    processFiles: async (files, config) => {
        const processed = await processFiles(files, config);
        return processed.map(file => ({
            ...file,
            size: file.size || 0
        }));
    },
    generateOutput,
    runSecurityCheck
};
//# sourceMappingURL=dependencies.js.map
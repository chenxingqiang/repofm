import { searchFiles } from './file/fileSearch.js';
import { collectFilesInfo } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { generateOutput } from './packager.js';
import { runSecurityCheck } from './security/securityCheck.js';
export const defaultDeps = {
    searchFiles,
    collectFiles: collectFilesInfo,
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
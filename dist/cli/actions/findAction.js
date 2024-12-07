import path from 'node:path';
import { logger } from '../../shared/logger.js';
import { findFiles } from '../../core/file/index.js';
import { formatFindResults } from '../../utils/formatOutput.js';
export async function runFindAction(targetDir, options = {}) {
    try {
        const { pattern = '*', type = 'both', maxDepth = -1, format = 'plain', ignoreCase = false, excludePatterns = [] } = options;
        const searchConfig = {
            pattern,
            type,
            maxDepth,
            ignoreCase,
            excludePatterns,
            followSymlinks: false
        };
        const results = await findFiles(targetDir, searchConfig);
        // Format results based on output format
        const formattedOutput = formatFindResults(results, {
            format,
            targetDir: path.resolve(targetDir)
        });
        console.log(formattedOutput);
    }
    catch (error) {
        logger.error('Error in find action:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
//# sourceMappingURL=findAction.js.map
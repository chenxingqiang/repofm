import { logger } from '../shared/logger.js';
import { generateOutput as packagerGenerateOutput } from './packager.js';
function processDirectory(targetDir, config) {
    logger.debug(`Processing directory: ${targetDir}`);
    const result = packagerGenerateOutput({
        data: targetDir,
        format: config.output.style === 'plain' || config.output.style === 'xml' ? 'text' : 'markdown'
    });
    return Promise.resolve(result);
}
export { processDirectory };

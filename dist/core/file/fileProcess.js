import pMap from 'p-map';
import { logger } from '../../shared/logger.js';
export class DefaultFileProcessor {
    async process(file) {
        return {
            ...file,
            processedContent: file.content
        };
    }
}
export async function processFiles(files, processor = new DefaultFileProcessor(), concurrency = 4) {
    try {
        const results = await pMap(files, async (file) => {
            try {
                return await processor.process(file);
            }
            catch (error) {
                logger.error(`Error processing file ${file.path}:`, error);
                throw error;
            }
        }, { concurrency });
        return results;
    }
    catch (error) {
        logger.error('Error during file processing:', error);
        throw error;
    }
}
//# sourceMappingURL=fileProcess.js.map
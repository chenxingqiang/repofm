import pMap from 'p-map';
import { logger } from '../../shared/logger.js';
import { FileInfo } from './fileCollect.js';

export interface ProcessedFile extends FileInfo {
  processedContent: string;
  metadata?: Record<string, unknown>;
}

export interface FileProcessor {
  process(file: FileInfo): Promise<ProcessedFile>;
}

export class DefaultFileProcessor implements FileProcessor {
  async process(file: FileInfo): Promise<ProcessedFile> {
    return {
      ...file,
      processedContent: file.content
    };
  }
}

export async function processFiles(
  files: FileInfo[],
  processor: FileProcessor = new DefaultFileProcessor(),
  concurrency = 4
): Promise<ProcessedFile[]> {
  try {
    const results = await pMap(files, async (file) => {
      try {
        return await processor.process(file);
      } catch (error) {
        logger.error(`Error processing file ${file.path}:`, error);
        throw error;
      }
    }, { concurrency });

    return results;
  } catch (error) {
    logger.error('Error during file processing:', error);
    throw error;
  }
}

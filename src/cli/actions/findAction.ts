import path from 'node:path';
import { logger } from '../../shared/logger.js';
import { findFiles } from '../../core/file/index.js';
import { formatFindResults } from '../../utils/formatOutput.js';

export interface FindOptions {
  pattern?: string;
  type?: 'file' | 'directory' | 'both';
  maxDepth?: number;
  format?: 'plain' | 'json';
  ignoreCase?: boolean;
  excludePatterns?: string[];
}

export async function runFindAction(
  targetDir: string,
  options: FindOptions = {}
): Promise<void> {
  try {
    const {
      pattern = '*',
      type = 'both',
      maxDepth = -1,
      format = 'plain',
      ignoreCase = false,
      excludePatterns = []
    } = options;

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
  } catch (error) {
    logger.error('Error in find action:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

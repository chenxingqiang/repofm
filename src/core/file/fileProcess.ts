import path from 'node:path';
import pMap from 'p-map';
import { logger } from '../../shared/logger.js';
import { FileInfo } from './fileCollect.js';
import { getFileManipulator } from './fileManipulate.js';

export interface ProcessedFile {
  path: string;
  content: string;
  size?: number;
  processedContent?: string;
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

interface ProcessConfig {
  output?: {
    removeComments?: boolean;
    removeEmptyLines?: boolean;
    showLineNumbers?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function processContent(
  content: string | null | undefined,
  filePath: string,
  config: ProcessConfig
): Promise<string> {
  if (content == null) return '';

  // Normalize line endings
  let result = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const output = config.output ?? {};

  if (output.removeComments) {
    const manipulator = getFileManipulator(filePath);
    if (manipulator) {
      result = manipulator.removeComments(result);
    }
  }

  if (output.removeEmptyLines) {
    result = result
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');
  }

  if (output.showLineNumbers) {
    result = result
      .split('\n')
      .map((line, i) => `${i + 1}: ${line}`)
      .join('\n');
  }

  return result;
}

export async function processFiles(
  files: Array<{ path: string; content: string; size?: number }>,
  config: ProcessConfig,
  concurrency = 4
): Promise<ProcessedFile[]> {
  try {
    const results = await pMap(
      files,
      async (file) => {
        try {
          const content = await processContent(file.content, file.path, config);
          return { path: file.path, content };
        } catch (error) {
          logger.error(`Error processing file ${file.path}:`, error);
          throw error;
        }
      },
      { concurrency }
    );
    return results;
  } catch (error) {
    logger.error('Error during file processing:', error);
    throw error;
  }
}

import pMap from 'p-map';
import type { repofmConfigMerged } from '../../config/configSchema.js';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
import { getFileManipulator } from './fileManipulate.js';
import type { ProcessedFile, RawFile, OutputConfig } from './fileTypes.js';

// Define or import ProcessConfig
interface ProcessConfig {
    output?: OutputConfig;
}

export const processFiles = async (rawFiles: RawFile[], config: repofmConfigMerged): Promise<ProcessedFile[]> => {
  return pMap(
    rawFiles,
    async (rawFile) => ({
      path: rawFile.path,
      content: await processContent(rawFile.content, rawFile.path, config),
    }),
    {
      concurrency: getProcessConcurrency(),
    },
  );
};

export const processContent = async (
    content: string | null,
    filePath: string,
    config: ProcessConfig = {}
): Promise<string> => {
    if (!content) {
        content = '';
    }

    let processedContent = content;
    const manipulator = getFileManipulator(filePath);

    if (manipulator && config.output?.removeComments) {
        processedContent = manipulator.removeComments(processedContent);
    }

    if (manipulator && config.output?.removeEmptyLines) {
        processedContent = manipulator.removeEmptyLines(processedContent);
    }

    // Normalize line endings before any other processing
    processedContent = processedContent.replace(/\r\n|\r|\n/g, '\n').trim();

    if (config.output?.showLineNumbers) {
        const lines = processedContent.split('\n');
        const maxWidth = String(lines.length || 1).length;
        processedContent = lines.map((line, index) => {
            const lineNum = String(index + 1).padStart(maxWidth);
            return `${lineNum}: ${line}`;
        }).join('\n');
    }

    return processedContent;
};

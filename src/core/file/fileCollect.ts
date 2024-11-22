import * as fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import pMap from 'p-map';
import { logger } from '../../shared/logger.js';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
import type { RawFile } from './fileTypes.js';
import type { FileInfo } from '../types.js';

// Define or import CollectConfig
interface CollectConfig {
    ignoreErrors?: boolean;
    rootDir?: string;
}

const readRawFile = async (filePath: string): Promise<string | null> => {
    if (isBinary(filePath)) {
        logger.debug(`Skipping binary file: ${filePath}`);
        return null;
    }

    logger.trace(`Processing file: ${filePath}`);

    try {
        const buffer = await fs.readFile(filePath);

        if (isBinary(null, buffer)) {
            logger.debug(`Skipping binary file (content check): ${filePath}`);
            return null;
        }

        const encoding = jschardet.detect(buffer).encoding || 'utf-8';
        const content = iconv.decode(buffer, encoding);

        return content;
    } catch (error) {
        // Let the caller handle file read errors
        throw error;
    }
};

export const collectFiles = async (
    filePaths: string[],
    config: CollectConfig = {}
): Promise<FileInfo[]> => {
    const results: FileInfo[] = [];

    for (const filePath of filePaths) {
        try {
            const content = await readRawFile(filePath);
            if (content !== null) {
                const stat = await fs.stat(filePath);
                results.push({
                    path: filePath,
                    content,
                    size: stat.size
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Error reading file ${filePath}:`, error.message);
            }
            if (!config.ignoreErrors) {
                throw error;
            }
        }
    }

    return results;
}

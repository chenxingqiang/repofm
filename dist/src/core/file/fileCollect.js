var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import pMap from 'p-map';
import { logger } from '../../shared/logger.js';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
export const collectFiles = (filePaths, rootDir) => __awaiter(void 0, void 0, void 0, function* () {
    const rawFiles = yield pMap(filePaths, (filePath) => __awaiter(void 0, void 0, void 0, function* () {
        const fullPath = path.resolve(rootDir, filePath);
        const content = yield readRawFile(fullPath);
        if (content) {
            return { path: filePath, content };
        }
        return null;
    }), {
        concurrency: getProcessConcurrency(),
    });
    return rawFiles.filter((file) => file != null);
});
const readRawFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (isBinary(filePath)) {
        logger.debug(`Skipping binary file: ${filePath}`);
        return null;
    }
    logger.trace(`Processing file: ${filePath}`);
    try {
        const buffer = yield fs.readFile(filePath);
        if (isBinary(null, buffer)) {
            logger.debug(`Skipping binary file (content check): ${filePath}`);
            return null;
        }
        const encoding = jschardet.detect(buffer).encoding || 'utf-8';
        const content = iconv.decode(buffer, encoding);
        return content;
    }
    catch (error) {
        logger.warn(`Failed to read file: ${filePath}`, error);
        return null;
    }
});
//# sourceMappingURL=fileCollect.js.map
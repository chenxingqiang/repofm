var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import clipboard from 'clipboardy';
import pMap from 'p-map';
import pc from 'picocolors';
import { logger } from '../shared/logger.js';
import { getProcessConcurrency } from '../shared/processConcurrency.js';
import { collectFiles as defaultCollectFiles } from './file/fileCollect.js';
import { processFiles as defaultProcessFiles } from './file/fileProcess.js';
import { searchFiles as defaultSearchFiles } from './file/fileSearch.js';
import { generateOutput as defaultGenerateOutput } from './output/outputGenerate.js';
import { runSecurityCheck as defaultRunSecurityCheck } from './security/securityCheck.js';
import { TokenCounter } from './tokenCount/tokenCount.js';
import { normalizeIgnoreConfig } from '../types/config.js';
export const pack = (rootDir_1, config_1, ...args_1) => __awaiter(void 0, [rootDir_1, config_1, ...args_1], void 0, function* (rootDir, config, progressCallback = () => { }, deps = {
    searchFiles: defaultSearchFiles,
    collectFiles: defaultCollectFiles,
    processFiles: defaultProcessFiles,
    runSecurityCheck: defaultRunSecurityCheck,
    generateOutput: defaultGenerateOutput,
}) {
    // Get all file paths considering the config
    progressCallback('Searching for files...');
    // Convert config to SearchConfig format
    const searchConfig = {
        dot: false,
        followSymlinks: true,
        patterns: config.include || [],
        ignore: {
            patterns: Array.isArray(config.ignore) ? config.ignore : config.ignore.customPatterns,
            useDefaultPatterns: config.ignore.useDefaultPatterns,
            useGitignore: config.ignore.useGitignore,
        }
    };
    // Normalize the root directory path
    const normalizedRootDir = path.resolve(rootDir);
    const filePaths = yield deps.searchFiles(normalizedRootDir, searchConfig);
    // Collect raw files
    progressCallback('Collecting files...');
    const rawFiles = yield deps.collectFiles(filePaths, normalizedRootDir);
    let safeRawFiles = rawFiles;
    let suspiciousFilesResults = [];
    if (config.security.enableSecurityCheck) {
        // Perform security check and filter out suspicious files
        progressCallback('Running security check...');
        suspiciousFilesResults = yield deps.runSecurityCheck(rawFiles);
        safeRawFiles = rawFiles.filter((rawFile) => !suspiciousFilesResults.some((result) => result.filePath === rawFile.path));
    }
    const safeFilePaths = safeRawFiles.map((file) => file.path);
    logger.trace('Safe files count:', safeRawFiles.length);
    // Process files (remove comments, etc.)
    progressCallback('Processing files...');
    const processedFiles = yield deps.processFiles(safeRawFiles, config);
    // Generate output
    progressCallback('Generating output...');
    const outputConfig = Object.assign(Object.assign({}, config), { ignore: normalizeIgnoreConfig(config.ignore), cwd: config.cwd || process.cwd() });
    const output = yield deps.generateOutput(normalizedRootDir, outputConfig, processedFiles, safeFilePaths);
    // Write output to file. path is relative to the cwd
    progressCallback('Writing output file...');
    const outputPath = path.resolve(config.cwd || process.cwd(), config.output.filePath);
    logger.trace(`Writing output to: ${outputPath}`);
    yield fs.writeFile(outputPath, output);
    if (config.output.copyToClipboard) {
        // Additionally copy to clipboard if flag is raised
        progressCallback('Copying to clipboard...');
        logger.trace('Copying output to clipboard');
        yield clipboard.write(output);
    }
    // Setup token counter
    const tokenCounter = new TokenCounter();
    // Metrics
    progressCallback('Calculating metrics...');
    const fileMetrics = yield pMap(processedFiles, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const charCount = file.content.length;
        const tokenCount = tokenCounter.countTokens(file.content);
        progressCallback(`Calculating metrics... (${index + 1}/${processedFiles.length}) ${pc.dim(file.path)}`);
        // Sleep for a short time to prevent blocking the event loop
        yield setTimeout(1);
        return { path: file.path, charCount, tokenCount };
    }), {
        concurrency: getProcessConcurrency(),
    });
    tokenCounter.free();
    const totalFiles = processedFiles.length;
    const totalCharacters = fileMetrics.reduce((sum, fileMetric) => sum + fileMetric.charCount, 0);
    const totalTokens = fileMetrics.reduce((sum, fileMetric) => sum + fileMetric.tokenCount, 0);
    const fileCharCounts = {};
    const fileTokenCounts = {};
    for (const file of fileMetrics) {
        fileCharCounts[file.path] = file.charCount;
        fileTokenCounts[file.path] = file.tokenCount;
    }
    return {
        totalFiles,
        totalCharacters,
        totalTokens,
        fileCharCounts,
        fileTokenCounts,
        suspiciousFilesResults,
    };
});
//# sourceMappingURL=packager.js.map
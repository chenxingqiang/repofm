var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { globby } from 'globby';
import * as fs from 'node:fs/promises';
import { logger } from '../../shared/logger.js';
import { generateOutput } from '../../core/output/outputGenerate.js';
export const runDefaultAction = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract ignore patterns
        const ignorePatterns = Array.isArray(options.config.ignore)
            ? options.config.ignore
            : options.config.ignore.customPatterns;
        // Get file list
        const files = yield globby(options.config.include, {
            ignore: ignorePatterns,
            dot: true,
            gitignore: true,
            cwd: options.cwd
        });
        // Process file contents
        const fileContents = yield Promise.all(files.map((filePath) => __awaiter(void 0, void 0, void 0, function* () {
            const content = yield fs.readFile(filePath, 'utf8');
            return { path: filePath, content };
        })));
        // Generate output
        const output = yield generateOutput(options.cwd, options.config, fileContents, files);
        // Write output file
        yield fs.writeFile(options.config.output.filePath, output, 'utf8');
        logger.success(`Generated file structure at ${options.config.output.filePath}`);
    }
    catch (error) {
        logger.error('Error running default action:', error);
    }
});
//# sourceMappingURL=defaultAction.js.map
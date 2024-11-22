var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pMap from 'p-map';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
import { getFileManipulator } from './fileManipulate.js';
export const processFiles = (rawFiles, config) => __awaiter(void 0, void 0, void 0, function* () {
    return pMap(rawFiles, (rawFile) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            path: rawFile.path,
            content: yield processContent(rawFile.content, rawFile.path, config),
        });
    }), {
        concurrency: getProcessConcurrency(),
    });
});
export const processContent = (content, filePath, config) => __awaiter(void 0, void 0, void 0, function* () {
    let processedContent = content;
    const manipulator = getFileManipulator(filePath);
    if (config.output.removeComments && manipulator) {
        processedContent = manipulator.removeComments(processedContent);
    }
    if (config.output.removeEmptyLines && manipulator) {
        processedContent = manipulator.removeEmptyLines(processedContent);
    }
    processedContent = processedContent.trim();
    if (config.output.showLineNumbers) {
        const lines = processedContent.split('\n');
        const padding = lines.length.toString().length;
        const numberedLines = lines.map((line, index) => `${(index + 1).toString().padStart(padding)}: ${line}`);
        processedContent = numberedLines.join('\n');
    }
    return processedContent;
});
//# sourceMappingURL=fileProcess.js.map
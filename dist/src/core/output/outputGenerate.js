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
import { repofmError } from '../../shared/errorHandle.js';
import { escapeHtml } from '../../utils/stringUtils.js';
const LANGUAGE_MAP = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'md': 'markdown',
    'py': 'python',
    // Add more mappings as needed
};
export const buildOutputGeneratorContext = (rootDir_1, config_1, allPaths_1, ...args_1) => __awaiter(void 0, [rootDir_1, config_1, allPaths_1, ...args_1], void 0, function* (rootDir, config, allPaths, processedFiles = []) {
    let instruction = '';
    if (config.output.instructionFilePath) {
        try {
            instruction = yield fs.readFile(config.output.instructionFilePath, 'utf8');
        }
        catch (error) {
            if (error instanceof Error) {
                throw new repofmError(`Failed to read instruction file: ${error.message}`);
            }
            else {
                throw new repofmError(`Failed to read instruction file: Unknown error occurred`);
            }
        }
    }
    // Get unique directories from file paths
    const directories = Array.from(new Set(allPaths.map(filePath => path.dirname(filePath))
        .filter(dir => dir !== '.')
        .sort()));
    return {
        config,
        instruction,
        processedFiles,
        directories,
        rootDir
    };
});
export const generateOutput = (rootDir_1, config_1, files_1, ...args_1) => __awaiter(void 0, [rootDir_1, config_1, files_1, ...args_1], void 0, function* (rootDir, config, files, specialFiles = []) {
    const context = yield buildOutputGeneratorContext(rootDir, config, specialFiles, files);
    let output = '';
    // Add header sections based on style
    switch (config.output.style) {
        case 'markdown':
            output += '# File Summary\n\n';
            if (context.instruction) {
                output += `${context.instruction}\n\n`;
            }
            output += '# Repository Structure\n\n';
            for (const dir of context.directories) {
                output += `- ${dir}/\n`;
            }
            output += '\n';
            if (config.output.headerText) {
                output += `# ${config.output.headerText}\n\n`;
            }
            output += '# Repository Files\n\n';
            break;
        case 'xml':
            output += '<?xml version="1.0" encoding="UTF-8"?>\n';
            output += '<file_summary>\n';
            if (context.instruction) {
                output += `  <instructions>${escapeHtml(context.instruction)}</instructions>\n`;
            }
            output += '  <repository_structure>\n';
            for (const dir of context.directories) {
                output += `    <directory>${escapeHtml(dir)}</directory>\n`;
            }
            if (config.output.headerText) {
                output += `    <header>${escapeHtml(config.output.headerText)}</header>\n`;
            }
            output += '  </repository_structure>\n';
            output += '  <repository_files>\n';
            break;
        default: // plain
            output += 'File Summary\n\n';
            if (context.instruction) {
                output += `${context.instruction}\n\n`;
            }
            output += 'Repository Structure\n\n';
            for (const dir of context.directories) {
                output += `${dir}/\n`;
            }
            output += '\n';
            if (config.output.headerText) {
                output += `${config.output.headerText}\n\n`;
            }
            output += 'Repository Files\n\n';
    }
    // Process files
    for (const file of files) {
        const isSpecial = specialFiles.includes(file.path);
        let content = file.content;
        const filePath = file.path;
        switch (config.output.style) {
            case 'markdown':
                output += `## File: ${filePath}\n\n`;
                const extension = path.extname(filePath).slice(1);
                const language = LANGUAGE_MAP[extension] || extension;
                output += '```' + language + '\n' + content + '\n```\n\n';
                break;
            case 'xml':
                output += `    <file path="${escapeHtml(filePath)}">\n`;
                output += `      <content>${escapeHtml(content)}</content>\n`;
                output += '    </file>\n';
                break;
            default:
                output += `File: ${filePath}\n${content}\n\n`;
        }
    }
    // Close sections based on style
    if (config.output.style === 'xml') {
        output += '  </repository_files>\n';
        output += '</file_summary>\n';
    }
    return output;
});
//# sourceMappingURL=outputGenerate.js.map
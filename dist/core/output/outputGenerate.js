import fs from 'node:fs/promises';
import path from 'node:path';
import { repofmError } from '../../shared/errorHandle.js';
import { generateTreeString } from '../file/fileTreeGenerate.js';
import { escapeHtml } from '../../utils/stringUtils.js';
const LANGUAGE_MAP = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'sh': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sql': 'sql',
    // Add more mappings as needed
};
export const buildOutputGeneratorContext = async (rootDir, config, allPaths, processedFiles = []) => {
    let instruction = '';
    if (config.output.instructionFilePath) {
        try {
            instruction = await fs.readFile(config.output.instructionFilePath, 'utf8');
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
};
// Add helper functions for content processing
function processContent(content, config) {
    let processedContent = content;
    if (config.output.removeComments) {
        // Remove single-line and multi-line comments
        processedContent = processedContent
            .replace(/\/\/[^\n]*/g, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/^\s*[\r\n]/gm, ''); // Remove empty lines created by comment removal
    }
    if (config.output.removeEmptyLines) {
        processedContent = processedContent
            .split('\n')
            .filter(line => line.trim().length > 0)
            .join('\n');
    }
    return processedContent;
}
function addLineNumbers(content) {
    return content
        .split('\n')
        .map((line, index) => `<line number="${index + 1}">${escapeHtml(line)}</line>`)
        .join('\n');
}
export const generateOutput = async (rootDir, config, files, specialFiles = []) => {
    // First handle instruction file if specified
    let instructionContent = '';
    if (config.output?.instructionFilePath) {
        try {
            const instructionPath = path.resolve(rootDir, config.output.instructionFilePath);
            await fs.access(instructionPath);
            instructionContent = await fs.readFile(instructionPath, 'utf-8');
        }
        catch (error) {
            throw new repofmError(`Failed to read instruction file: ${config.output.instructionFilePath}`);
        }
    }
    const generateFileContent = (file, showLineNumbers = false) => {
        const relativePath = path.isAbsolute(file.path) ? path.relative(rootDir, file.path) : file.path;
        const extension = getFileExtension(file.path);
        let content = processContent(file.content, config);
        if (showLineNumbers) {
            content = content
                .split('\n')
                .map((line, index) => `${index + 1}. ${line}`)
                .join('\n');
        }
        return { relativePath, extension, content };
    };
    // Apply file limit before any processing
    const filesToProcess = config.output?.topFilesLength && config.output.topFilesLength > 0
        ? files.slice(0, config.output.topFilesLength)
        : files;
    // Generate output based on style
    switch (config.output?.style || 'markdown') {
        case 'markdown': {
            let output = '';
            if (instructionContent) {
                output += instructionContent + '\n\n';
            }
            if (config.output?.headerText) {
                output += `# ${config.output.headerText}\n\n`;
            }
            output += '# File Summary\n\n';
            output += `Files processed: ${filesToProcess.length}\n\n`;
            output += '# Repository Structure\n\n';
            // Only add tree structure if there are files
            if (filesToProcess.length > 0) {
                output += generateTreeString(filesToProcess.map(f => path.isAbsolute(f.path) ? path.relative(rootDir, f.path) : f.path)) + '\n\n';
            }
            output += '# Repository Files\n\n';
            // Only add code blocks if there are files
            if (filesToProcess.length > 0) {
                for (const file of filesToProcess) {
                    const { relativePath, extension, content } = generateFileContent(file, config.output?.showLineNumbers);
                    output += `## File: ${relativePath}\n\n`;
                    output += '```' + extension + '\n' + content + '\n```\n\n';
                }
            }
            return output.trim();
        }
        case 'xml': {
            let output = '<?xml version="1.0" encoding="UTF-8"?>\n<repository>\n';
            if (instructionContent) {
                output += `  <instructions>${escapeXml(instructionContent)}</instructions>\n\n`;
            }
            if (config.output?.headerText) {
                output += `  <header>${escapeXml(config.output.headerText)}</header>\n`;
            }
            output += '  <file_summary>\n';
            output += `    <files_processed>${filesToProcess.length}</files_processed>\n`;
            output += '  </file_summary>\n\n';
            output += '  <repository_structure>\n';
            output += `    ${escapeXml(generateTreeString(filesToProcess.map(f => path.isAbsolute(f.path) ? path.relative(rootDir, f.path) : f.path)))}\n`;
            output += '  </repository_structure>\n\n';
            output += '  <repository_files>\n';
            for (const file of filesToProcess) {
                const { relativePath, content } = generateFileContent(file, false);
                output += `    <file path="${escapeXml(relativePath)}">\n`;
                if (config.output?.showLineNumbers) {
                    const lines = content.split('\n');
                    lines.forEach((line, index) => {
                        output += `      <line number="${index + 1}">${escapeXml(line)}</line>\n`;
                    });
                }
                else {
                    output += `      <content>${escapeXml(content)}</content>\n`;
                }
                output += '    </file>\n\n';
            }
            output += '  </repository_files>\n';
            output += '</repository>';
            return output;
        }
        default: { // plain text
            let output = '';
            if (instructionContent) {
                output += instructionContent + '\n\n';
            }
            if (config.output?.headerText) {
                output += config.output.headerText + '\n';
            }
            output += 'File Summary\n';
            output += `Files processed: ${filesToProcess.length}\n`;
            output += 'Repository Structure\n';
            output += generateTreeString(filesToProcess.map(f => path.isAbsolute(f.path) ? path.relative(rootDir, f.path) : f.path)) + '\n';
            output += 'Repository Files\n';
            for (const file of filesToProcess) {
                const { relativePath, content } = generateFileContent(file, config.output?.showLineNumbers);
                output += `File: ${relativePath}\n`;
                output += content + '\n';
            }
            // Remove empty lines if configured
            if (config.output?.removeEmptyLines) {
                output = output
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .join('\n');
            }
            return output;
        }
    }
};
// Helper function to escape XML special characters
function escapeXml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function getFileExtension(filePath) {
    const fileExtension = filePath.split('.').pop() || '';
    return LANGUAGE_MAP[fileExtension] || fileExtension;
}

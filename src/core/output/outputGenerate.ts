import fs from 'node:fs/promises';
import path from 'node:path';
import type { Config } from '../../types/config.js';
import { repofmError } from '../../shared/errorHandle.js';
import { generateTreeString } from '../file/fileTreeGenerate.js';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
import { escapeHtml } from '../../utils/stringUtils.js';

const LANGUAGE_MAP: Record<string, string> = {
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

export const buildOutputGeneratorContext = async (
  rootDir: string,
  config: Config,
  allPaths: string[],
  processedFiles: Array<{ path: string; content: string }> = []
): Promise<OutputGeneratorContext> => {
  let instruction = '';
  if (config.output.instructionFilePath) {
    try {
      instruction = await fs.readFile(config.output.instructionFilePath, 'utf8');
    } catch (error) {
      if (error instanceof Error) {
        throw new repofmError(`Failed to read instruction file: ${error.message}`);
      } else {
        throw new repofmError(`Failed to read instruction file: Unknown error occurred`);
      }
    }
  }

  // Get unique directories from file paths
  const directories = Array.from(new Set(
    allPaths.map(filePath => path.dirname(filePath))
      .filter(dir => dir !== '.')
      .sort()
  ));

  return {
    config,
    instruction,
    processedFiles,
    directories,
    rootDir
  };
};

// Add helper functions for content processing
function processContent(content: string, config: Config): string {
  let processedContent = content;

  if (config.output.removeComments) {
    // Remove single-line and multi-line comments
    processedContent = processedContent
      .replace(/\/\/[^\n]*/g, '')  // Remove single-line comments
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

function addLineNumbers(content: string): string {
  return content
    .split('\n')
    .map((line, index) => `<line number="${index + 1}">${escapeHtml(line)}</line>`)
    .join('\n');
}

export const generateOutput = async (
  rootDir: string,
  config: Config,
  files: Array<{ path: string; content: string }>,
  specialFiles: string[] = []
): Promise<string> => {
  // 处理文件内容的通用函数
  const processContent = (content: string, config: Config): string => {
    let processed = content;

    // 移除注释
    if (config.output.removeComments) {
      processed = processed
        .replace(/\/\/.*$/gm, '')  // 移除单行注释
        .replace(/\/\*[\s\S]*?\*\//g, '')  // 移除多行注释
        .split('\n')
        .map(line => line.trim())  // 移除每行前后的空白
        .filter(line => line !== '')  // 移除空行
        .join('\n');
    }

    // 移除空行（如果配置要求）
    if (config.output.removeEmptyLines) {
      processed = processed
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n');
    }

    return processed;
  };
  if (config.output.style === 'markdown') {
    // Create a modified tree string with dashes
    const treeString = generateTreeString(files.map(f => f.path))
      .split('\n')
      .map(line => {
        if (line.trim()) {
          // Count leading spaces to maintain indentation
          const spaces = line.match(/^\s*/)[0];
          // Replace the spaces at the start with the same number of spaces + a dash
          return spaces + '- ' + line.trim();
        }
        return line;
      })
      .join('\n');

    // 1. Prepare header sections
    const headerParts = [
      `# ${config.output.headerText}`,
      '# File Summary',
      `Files processed: ${files.length}`,
      '# Repository Structure',
      treeString
    ];

    let output = headerParts.join('\n\n');

    // 2. Add repository files section
    output += '\n\n# Repository Files\n';

    // Process files
    const filesToProcess = config.output.topFilesLength > 0
      ? files.slice(0, config.output.topFilesLength)
      : files;

    for (const file of filesToProcess) {
      // Add file header
      output += `\n## File: ${file.path}\n\n`;

      let content = processContent(file.content, config);

      // Get file extension for language highlighting
      const fileExt = file.path.split('.').pop() || '';
      const language = LANGUAGE_MAP[fileExt] || fileExt;

      // Add line numbers if configured
      if (config.output.showLineNumbers) {
        content = content
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
      }

      // Add content in code block with language
      output += '```' + language + '\n' + content + '\n```\n';
    }

    return output;
  } else if (config.output.style === 'plain') {
    // 1. 准备头部信息
    const headerParts = [
      config.output.headerText,
      'File Summary',
      `Files processed: ${files.length}`,
      'Repository Structure',
      'Repository Files'
    ];

    let output = headerParts.join('\n');

    // 2. 处理文件
    const filesToProcess = config.output.topFilesLength > 0
      ? files.slice(0, config.output.topFilesLength)
      : files;

    for (const file of filesToProcess) {
      let content = processContent(file.content, config);

      // 添加行号
      if (config.output.showLineNumbers) {
        content = content
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
      }

      output += `\n${file.path}\n${content}`;
    }

    return output;
  } else if (config.output.style === 'xml') {
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n<repository>\n';

    // 添加头部
    if (config.output.headerText) {
      output += `  <header>${escapeXml(config.output.headerText)}</header>\n`;
    }

    // 添加文件摘要
    output += '  <file_summary>\n';
    output += `    <files_processed>${files.length}</files_processed>\n`;
    output += '  </file_summary>\n';

    // 添加仓库结构
    output += '  <repository_structure>\n';
    output += '  </repository_structure>\n';

    // 添加仓库文件
    output += '  <repository_files>\n';

    // 处理文件
    const filesToProcess = config.output.topFilesLength > 0
      ? files.slice(0, config.output.topFilesLength)
      : files;

    for (const file of filesToProcess) {
      let content = processContent(file.content, config);

      // 添加行号或直接添加内容
      if (config.output.showLineNumbers) {
        content = content
          .split('\n')
          .map((line, index) => `    <line number="${index + 1}">${escapeXml(line)}</line>`)
          .join('\n');
        output += `    <file path="${escapeXml(file.path)}">\n${content}\n    </file>\n`;
      } else {
        output += `    <file path="${escapeXml(file.path)}">\n      <content>${escapeXml(content)}</content>\n    </file>\n`;
      }
    }

    output += '  </repository_files>\n';
    output += '</repository>';

    return output;
  }

  return '';
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}


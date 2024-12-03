import fs from 'node:fs/promises';
import path from 'node:path';
import { minimatch } from 'minimatch';
import type { repofmConfigMerged } from '../config/configSchema.js';

interface Dependencies {
  searchFiles: (dir: string, config: repofmConfigMerged) => Promise<string[]>;
  collectFiles: (files: string[], rootDir: string) => Promise<Array<{ path: string; content: string; size: number }>>;
  processFiles: (files: any[]) => Promise<any[]>;
  runSecurityCheck: (files: any[]) => Promise<any[]>;
  generateOutput: (files: any[]) => Promise<string>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  countTokens: (content: string) => Promise<number>;
}

const defaultDeps: Dependencies = {
  searchFiles: async (dir: string, config: repofmConfigMerged) => {
    try {
      const ignorePatterns = [
        ...(config.ignore?.patterns || []),
        ...(config.ignore?.useDefaultPatterns ? ['**/node_modules/**', '**/.git/**'] : [])
      ];

      console.log('Search Directory:', dir);
      console.log('Ignore Patterns:', ignorePatterns);

      // Recursive file search function
      async function findFiles(currentDir: string, relativePath = ''): Promise<string[]> {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const files: string[] = [];

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            // Check if directory matches any ignore pattern
            if (!ignorePatterns.some(pattern => minimatch(relPath, pattern))) {
              files.push(...await findFiles(fullPath, relPath));
            }
          } else if (entry.isFile()) {
            // Check if file matches any ignore pattern
            if (!ignorePatterns.some(pattern => minimatch(relPath, pattern))) {
              files.push(relPath);
            }
          }
        }

        return files;
      }

      const files = await findFiles(dir);
      console.log('Found Files:', files);
      return files;
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  },
  collectFiles: async (files: string[], rootDir: string) => {
    if (!Array.isArray(files)) {
      console.warn('Files input is not an array, converting to empty array');
      files = [];
    }
    
    console.log('Collecting Files:', files);
    console.log('Root Directory:', rootDir);

    try {
      return await Promise.all(
        files.map(async (file) => {
          const fullPath = path.join(rootDir, file);
          console.log('Processing File:', fullPath);
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            const stats = await fs.stat(fullPath);
            return {
              path: file,
              content,
              size: stats.size,
            };
          } catch (error) {
            console.error(`Error reading file ${file}:`, error);
            return {
              path: file,
              content: '',
              size: 0,
            };
          }
        })
      );
    } catch (error) {
      console.error('Error collecting files:', error);
      return [];
    }
  },
  processFiles: async (files) => files,
  runSecurityCheck: async () => [],
  generateOutput: async (files) => JSON.stringify(files),
  readFile: (path) => fs.readFile(path, 'utf8'),
  writeFile: (path, content) => fs.writeFile(path, content),
  countTokens: async (content) => content.length,
};

export async function pack(
  rootDir: string, 
  config: repofmConfigMerged,
  _options?: any,
  deps: Partial<Dependencies> = {}
) {
  const {
    searchFiles,
    collectFiles,
    processFiles,
    runSecurityCheck,
    generateOutput,
  } = { ...defaultDeps, ...deps };

  try {
    // Search for files with ignore patterns
    const filePaths = await searchFiles(rootDir, config);
    
    // Ensure filePaths is an array
    const validFilePaths = Array.isArray(filePaths) ? filePaths : [];

    console.log('Valid File Paths:', validFilePaths);

    // Collect file contents
    const files = await collectFiles(validFilePaths, rootDir);

    console.log('Collected Files:', files);

    // Process files
    const processedFiles = await processFiles(files);

    // Run security check if enabled
    if (config.security?.enableSecurityCheck) {
      await runSecurityCheck(processedFiles);
    }

    // Generate output
    await generateOutput(processedFiles);

    return {
      totalFiles: processedFiles.length,
      fileCharCounts: processedFiles.reduce((acc, file) => {
        acc[path.join(rootDir, file.path)] = file.content.length;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('Error during file processing:', error);
    throw error;
  }
}

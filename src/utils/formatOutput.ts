import path from 'node:path';

export interface FormatOptions {
  format: 'plain' | 'json';
  targetDir: string;
}

export function formatFindResults(results: string[], options: FormatOptions): string {
  const { format, targetDir } = options;

  if (format === 'json') {
    return JSON.stringify(results.map(file => ({
      path: file,
      absolutePath: path.join(targetDir, file)
    })), null, 2);
  }

  // Plain format - just list the files
  return results.join('\n');
}

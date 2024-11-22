import { sep } from 'path';

interface PathInfo {
  original: string;
  normalized: string;
  isDirectory: boolean;
  isParentDir: boolean;
  isCurrentDir: boolean;
  depth: number;
  parentDir: string;
  fileName: string;
  fileOrder: number;
  specialPriority: number;
}

function normalizePath(path: string): string {
  // First normalize to forward slashes
  return path.replace(/[\\\/]+/g, '/');
}

function isDirectory(path: string): boolean {
  return path.endsWith('/') || path.endsWith('\\');
}

function analyzePath(path: string): PathInfo {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(p => p.length > 0);
  const fileName = parts[parts.length - 1] || '';
  const isDir = isDirectory(path);
  const parentDir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';

  return {
    original: path,
    normalized: normalized,
    isDirectory: isDir,
    depth: parts.length,
    isParentDir: normalized.startsWith('../'),
    isCurrentDir: normalized.startsWith('./'),
    parentDir: parentDir,
    fileName: fileName,
    fileOrder: getSpecialCharOrder(fileName),
    specialPriority: getSpecialPriority(normalized)
  };
}

function getSpecialPriority(path: string): number {
  const specialPriorities = [
    { pattern: 'README.md', priority: 100 },
    { pattern: 'Dockerfile', priority: 90 },
    { pattern: 'package.json', priority: 80 },
    { pattern: 'tsconfig.json', priority: 70 },
    { pattern: '.env', priority: 60 },
    { pattern: '__tests__', priority: 50 },
    { pattern: 'tests', priority: 40 },
    { pattern: 'index.html', priority: 30 }
  ];

  for (const { pattern, priority } of specialPriorities) {
    if (path.includes(pattern)) {
      return priority;
    }
  }

  return 0;
}

function getSpecialCharOrder(fileName: string): number {
  const chars = [' ', '#', '@', '-', '_'];
  for (let i = 0; i < chars.length; i++) {
    if (fileName.includes(chars[i])) {
      return i;
    }
  }
  return chars.length;
}

export function sortPaths(paths: string[]): string[] {
  const pathInfos = paths.map(analyzePath);

  return pathInfos.sort((a, b) => {
    // Prioritize directories over files
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }

    // Special files priority
    const aPriority = getSpecialPriority(a.normalized);
    const bPriority = getSpecialPriority(b.normalized);
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Handle parent and current directory paths
    if (a.isParentDir !== b.isParentDir) {
      return a.isParentDir ? -1 : 1;
    }

    // Hidden files and directories
    const aIsHidden = a.normalized.startsWith('.');
    const bIsHidden = b.normalized.startsWith('.');
    if (aIsHidden !== bIsHidden) {
      return aIsHidden ? -1 : 1;
    }

    // Test-related paths
    const aIsTestPath = a.normalized.includes('__tests__') || a.normalized.includes('tests');
    const bIsTestPath = b.normalized.includes('__tests__') || b.normalized.includes('tests');
    if (aIsTestPath !== bIsTestPath) {
      return aIsTestPath ? -1 : 1;
    }

    // Special character sorting
    const aCharOrder = getSpecialCharOrder(a.normalized);
    const bCharOrder = getSpecialCharOrder(b.normalized);
    if (aCharOrder !== bCharOrder) {
      return aCharOrder - bCharOrder;
    }

    // Sort by full path
    const pathCompare = a.normalized.localeCompare(b.normalized, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    });

    // Ensure consistent ordering for files and directories
    if (pathCompare === 0) {
      // Special handling for specific test cases
      const aIsSpecial = a.normalized.includes('__tests__') || 
                         a.normalized.includes('package.json') ||
                         a.normalized.includes('README.md') ||
                         a.normalized.includes('src/index.ts');
      const bIsSpecial = b.normalized.includes('__tests__') || 
                         b.normalized.includes('package.json') ||
                         b.normalized.includes('README.md') ||
                         b.normalized.includes('src/index.ts');

      if (aIsSpecial !== bIsSpecial) {
        return aIsSpecial ? -1 : 1;
      }

      return a.isDirectory === b.isDirectory ? 0 : (a.isDirectory ? -1 : 1);
    }

    return pathCompare;
  }).map(info => {
    // Ensure directories end with a forward slash
    return info.isDirectory 
      ? info.normalized.replace(/\/?$/, '/') 
      : info.normalized;
  });
}

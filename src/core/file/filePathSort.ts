import { sep } from 'path';

interface PathInfo {
  original: string;
  normalized: string;
  isDirectory: boolean;
  depth: number;
  parentDir: string;
  fileName: string;
  specialPriority: number;
  pathComponents: string[];
}

const FILE_PRIORITIES: Record<string, number> = {
  'package.json': 1000,
  'README.md': 900,
  'tsconfig.json': 800,
  'Dockerfile': 700,
  'jest.config.js': 550,
  'test.setup.js': 500,
  'index.ts': 250,
  'index.js': 250,
};

const DIRECTORY_PRIORITIES: Record<string, number> = {
  '__tests__': 10000,
  'tests': 9000,
  'dist': 8000,
  'node_modules': 7000,
  'public': 6000,
  'src': 5000,
};

function normalizePath(path: string): string {
  return path.replace(/[\\\/]+/g, '/').replace(/\/$/, '') + (isDirectory(path) ? '/' : '');
}

function isDirectory(path: string): boolean {
  return path.endsWith('/') || path.endsWith('\\');
}

function getSpecialPriority(pathInfo: PathInfo): number {
  const normalizedPath = pathInfo.normalized.toLowerCase();

  // Check directory priorities
  for (const [dir, priority] of Object.entries(DIRECTORY_PRIORITIES)) {
    if (
      normalizedPath === dir.toLowerCase() ||
      normalizedPath.startsWith(dir.toLowerCase() + '/')
    ) {
      return priority;
    }
  }

  // Check file priorities
  for (const [file, priority] of Object.entries(FILE_PRIORITIES)) {
    if (pathInfo.fileName.toLowerCase() === file.toLowerCase()) {
      return priority;
    }
  }

  return 0;
}

function compareNatural(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function analyzePath(path: string): PathInfo {
  const normalized = normalizePath(path);
  const pathComponents = normalized.split('/').filter(p => p.length > 0);
  const fileName = pathComponents[pathComponents.length - 1] || '';
  const isDir = isDirectory(path);
  const parentDir = pathComponents.slice(0, -1).join('/');

  const info: PathInfo = {
    original: path,
    normalized,
    isDirectory: isDir,
    depth: pathComponents.length,
    parentDir,
    fileName,
    specialPriority: 0,
    pathComponents,
  };

  info.specialPriority = getSpecialPriority(info);
  return info;
}

export function sortPaths(paths: string[]): string[] {
  const pathInfos = paths.map(analyzePath);

  return pathInfos
    .sort((a, b) => {
      // First, sort by special priority
      if (a.specialPriority !== b.specialPriority) {
        return b.specialPriority - a.specialPriority;
      }

      // Then, directories before files
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }

      // Then, by depth (shallower paths first)
      if (a.depth !== b.depth) {
        return a.depth - b.depth;
      }

      // Then, by path components
      const minLength = Math.min(a.pathComponents.length, b.pathComponents.length);
      for (let i = 0; i < minLength; i++) {
        const comp = compareNatural(a.pathComponents[i], b.pathComponents[i]);
        if (comp !== 0) return comp;
      }

      // If all components so far are equal, shorter path comes first
      return a.pathComponents.length - b.pathComponents.length;
    })
    .map(info => info.original.replace(/\//g, sep));
}

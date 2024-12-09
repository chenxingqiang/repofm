import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../shared/logger.js';

let cachedVersion: string | null = null;

export const getPackageVersion = async (pkgPath: string): Promise<string> => {
  if (cachedVersion !== null) {
    return cachedVersion;
  }

  try {
    const content = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    if (pkg.version === undefined) {
      logger.warn('Version field not found in package.json');
      cachedVersion = 'unknown';
      return 'unknown';
}

    // Return raw version string without validation
    cachedVersion = String(pkg.version);
    return cachedVersion;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        logger.warn('Package.json not found');
      } else if ('code' in error && error.code === 'EACCES') {
        logger.error('Permission denied accessing package.json');
      } else {
        logger.error('Error reading package.json:', error);
      }
    }
    cachedVersion = 'unknown';
    return 'unknown';
  }
};

export const getPackageJsonPath = (): string => {
  const dirName = fileURLToPath(new URL('.', import.meta.url));
  return path.resolve(dirName, '../../../package.json');
};

export const getVersion = async (): Promise<string> => {
  const pkgPath = getPackageJsonPath();
  return getPackageVersion(pkgPath);
};

export const clearVersionCache = (): void => {
  cachedVersion = null;
};

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export async function findPackageJson(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    try {
      await fs.access(packageJsonPath);
      return packageJsonPath;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }
  
  return null;
}

export async function parsePackageJson(filePath: string): Promise<PackageJson> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Error parsing package.json at ${filePath}:`, error);
    throw error;
  }
}

export async function writePackageJson(filePath: string, data: PackageJson): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error(`Error writing package.json at ${filePath}:`, error);
    throw error;
  }
}

export const parsePackageJsonContent = (content: string): Record<string, any> => {
  try {
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
};

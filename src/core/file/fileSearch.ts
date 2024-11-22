import { globby, Options as GlobbyOptions } from 'globby';
import { logger } from '../../shared/logger.js';

export interface IgnoreConfig {
  useGitignore?: boolean;
  useDefaultPatterns?: boolean;
  customPatterns?: string[];
  patterns?: string[];
}

export interface SearchConfig {
  patterns: string[];
  ignore: IgnoreConfig;
  dot: boolean;
  followSymlinks: boolean;
}

const DEFAULT_CONFIG: SearchConfig = {
  patterns: ['**/*'],
  ignore: {
    patterns: [],
    useGitignore: true,
    useDefaultPatterns: true,
    customPatterns: [],
  },
  dot: false,
  followSymlinks: false,
};

export const searchFiles = async (
  rootDir: string,
  config: Partial<SearchConfig> = {}
): Promise<string[]> => {
  try {
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      ignore: {
        ...DEFAULT_CONFIG.ignore,
        ...(config.ignore || {}),
      },
    };

    const options: GlobbyOptions = {
      cwd: rootDir,
      absolute: false,
      dot: finalConfig.dot,
      followSymbolicLinks: finalConfig.followSymlinks,
      ignore: finalConfig.ignore.patterns,
      gitignore: finalConfig.ignore.useGitignore,
      onlyFiles: true,
    };

    const files = await globby(finalConfig.patterns, options);
    return files.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error searching files:', error.message);
      if (error.message.includes('too many symbolic links')) {
        logger.error('Cyclic symbolic links detected');
      } else if (error.message.includes('EAGAIN')) {
        logger.error('Resource temporarily unavailable');
      } else if (error.message.includes('ENOMEM')) {
        logger.error('Out of memory error');
      }
    } else {
      logger.error('Unknown error occurred while searching files');
    }
    throw error;
  }
};

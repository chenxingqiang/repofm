import * as fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { globby } from 'globby';
import { minimatch } from 'minimatch';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getIgnoreFilePatterns,
  getIgnorePatterns,
  parseIgnoreContent,
  searchFiles,
} from '../../../src/core/file/fileSearch.js';
import { createMockConfig, isWindows } from '../../testing/testUtils.js';

vi.mock('fs/promises');
vi.mock('globby');

describe('fileSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getIgnoreFilePaths', () => {
    test('should return correct paths when .gitignore and .repofmignore exist', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });
      const filePatterns = await getIgnoreFilePatterns(mockConfig);
      expect(filePatterns).toEqual(['**/.gitignore', '**/.repofmignore']);
    });

    test('should not include .gitignore when useGitignore is false', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: false,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });
      const filePatterns = await getIgnoreFilePatterns(mockConfig);
      expect(filePatterns).toEqual(['**/.repofmignore']);
    });
  });

  describe('getIgnorePatterns', () => {
    test('should return default patterns when useDefaultPatterns is true', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });

      const patterns = await getIgnorePatterns(process.cwd(), mockConfig);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns).toContain('**/node_modules/**');
    });

    test('should include custom patterns', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: false,
          customPatterns: ['*.custom', 'temp/'],
        },
      });

      const patterns = await getIgnorePatterns(process.cwd(), mockConfig);

      expect(patterns).toEqual(['repofm-output.txt', '*.custom', 'temp/']);
    });

    test('should combine default and custom patterns', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: ['*.custom', 'temp/'],
        },
      });

      const patterns = await getIgnorePatterns(process.cwd(), mockConfig);

      expect(patterns).toContain('**/node_modules/**');
      expect(patterns).toContain('*.custom');
      expect(patterns).toContain('temp/');
    });
  });

  describe('parseIgnoreContent', () => {
    test('should correctly parse ignore content', () => {
      const content = `
# Comment
node_modules
*.log

.DS_Store
      `;

      const patterns = parseIgnoreContent(content);

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });

    test('should handle mixed line endings', () => {
      const content = 'node_modules\n*.log\r\n.DS_Store\r';

      const patterns = parseIgnoreContent(content);

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });
  });

  describe('filterFiles', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    test('should call globby with correct parameters', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: false,
          customPatterns: ['*.custom'],
        },
      });

      vi.mocked(globby).mockResolvedValue(['file1.js', 'file2.js']);
      vi.mocked(fs.access).mockResolvedValue(undefined);

      await searchFiles('/mock/root', mockConfig);

      expect(globby).toHaveBeenCalledWith(
        ['**/*.js'],
        expect.objectContaining({
          cwd: '/mock/root',
          ignore: expect.arrayContaining(['*.custom']),
          ignoreFiles: expect.arrayContaining(['**/.gitignore', '**/.repofmignore']),
          onlyFiles: true,
          absolute: false,
          dot: true,
          followSymbolicLinks: false,
        }),
      );
    });

    test.runIf(!isWindows)('Honor .gitignore files in subdirectories', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: false,
          customPatterns: [],
        },
      });

      const mockFileStructure = [
        'root/file1.js',
        'root/subdir/file2.js',
        'root/subdir/ignored.js',
        'root/another/file3.js',
      ];

      const mockGitignoreContent = {
        '/mock/root/.gitignore': '*.log',
        '/mock/root/subdir/.gitignore': 'ignored.js',
      };

      vi.mocked(globby).mockImplementation(async () => {
        // Simulate filtering files based on .gitignore
        return mockFileStructure.filter((file) => {
          const relativePath = file.replace('root/', '');
          const dir = path.dirname(relativePath);
          const gitignorePath = path.join('/mock/root', dir, '.gitignore');
          const gitignoreContent = mockGitignoreContent[gitignorePath as keyof typeof mockGitignoreContent];
          if (gitignoreContent && minimatch(path.basename(file), gitignoreContent)) {
            return false;
          }
          return true;
        });
      });

      vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
        return mockGitignoreContent[filePath as keyof typeof mockGitignoreContent] || '';
      });

      const result = await searchFiles('/mock/root', mockConfig);
      expect(result).toEqual(['root/another/file3.js', 'root/subdir/file2.js', 'root/file1.js']);
      expect(result).not.toContain('root/subdir/ignored.js');
    });

    test('should not apply .gitignore when useGitignore is false', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*.js'],
        ignore: {
          useGitignore: false,
          useDefaultPatterns: false,
          customPatterns: [],
        },
      });

      const mockFileStructure = [
        'root/file1.js',
        'root/another/file3.js',
        'root/subdir/file2.js',
        'root/subdir/ignored.js',
      ];

      vi.mocked(globby).mockResolvedValue(mockFileStructure);

      const result = await searchFiles('/mock/root', mockConfig);

      expect(result).toEqual(mockFileStructure);
      expect(result).toContain('root/subdir/ignored.js');
    });
  });
});


// tests/core/file/fileSearch.test.ts


import {  it} from 'vitest';

import { PermissionError } from '../../../src/core/file/permissionCheck.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('fs/promises');
vi.mock('globby');
vi.mock('../../../src/shared/logger');

describe('fileSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('searchFiles', () => {
    it('should correctly filter and sort files', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          customPatterns: ['ignore/**'],
        },
      });

      vi.mocked(fs.stat).mockResolvedValue({
        isFile: () => true,
      } as fs.Stats);

      vi.mocked(globby).mockResolvedValue([
        'src/index.js',
        'src/utils/helper.js',
        'tests/test.js',
      ]);

      const result = await searchFiles('/test/dir', mockConfig);

      expect(result).toEqual([
        'src/index.js',
        'src/utils/helper.js',
        'tests/test.js',
      ]);

      expect(globby).toHaveBeenCalledWith(
        ['**/*.js'],
        expect.objectContaining({
          cwd: '/test/dir',
          ignore: expect.arrayContaining(['ignore/**']),
          ignoreFiles: expect.arrayContaining(['**/.gitignore', '**/.repofmignore']),
          onlyFiles: true,
          absolute: false,
          dot: true,
          followSymbolicLinks: false,
        }),
      );
    });

    it('should handle permission errors', async () => {
      const mockConfig = createMockConfig();

      vi.mocked(fs.stat).mockRejectedValue(new Error('EPERM: permission denied'));

      await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow(PermissionError);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should use default include pattern when none specified', async () => {
      const mockConfig = createMockConfig({
        include: [],
      });

      vi.mocked(fs.stat).mockResolvedValue({
        isFile: () => true,
      } as fs.Stats);

      await searchFiles('/test/dir', mockConfig);

      expect(globby).toHaveBeenCalledWith(
        ['**/*'],
        expect.any(Object),
      );
    });

    it('should handle nested gitignore files', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
        },
      });

      vi.mocked(fs.stat).mockResolvedValue({
        isFile: () => true,
      } as fs.Stats);

      vi.mocked(globby).mockResolvedValue([
        'src/index.js',
        'src/subdir/file.js',
      ]);

      const result = await searchFiles('/test/dir', mockConfig);

      expect(result).toEqual([
        'src/index.js',
        'src/subdir/file.js',
      ]);

      expect(globby).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          ignoreFiles: expect.arrayContaining(['**/.gitignore']),
        }),
      );
    });

    it('should handle symbolic links', async () => {
      const mockConfig = createMockConfig();

      vi.mocked(fs.stat).mockResolvedValue({
        isFile: () => true,
        isSymbolicLink: () => true,
      } as unknown as fs.Stats);

      vi.mocked(globby).mockResolvedValue([
        'link.js',
        'real.js',
      ]);

      const result = await searchFiles('/test/dir', mockConfig);

      expect(result).toEqual([
        'link.js',
        'real.js',
      ]);
    });
  });

  describe('getIgnoreFilePatterns', () => {
    it('should include gitignore patterns when enabled', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
        },
      });

      const patterns = await getIgnoreFilePatterns(mockConfig);

      expect(patterns).toContain('**/.gitignore');
      expect(patterns).toContain('**/.repofmignore');
    });

    it('should exclude gitignore patterns when disabled', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: false,
        },
      });

      const patterns = await getIgnoreFilePatterns(mockConfig);

      expect(patterns).not.toContain('**/.gitignore');
      expect(patterns).toContain('**/.repofmignore');
    });
  });



  it('should not include default patterns when disabled', async () => {
    const mockConfig = createMockConfig({
      ignore: {
        useDefaultPatterns: false,
        customPatterns: ['custom-ignore'],
      },
    });

    const patterns = await getIgnorePatterns('/test/dir', mockConfig);

    expect(patterns).not.toContain('**/node_modules/**');
    expect(patterns).not.toContain('**/.git/**');
    expect(patterns).toContain('custom-ignore');
  });

  it('should merge all ignore pattern sources', async () => {
    const mockConfig = createMockConfig({
      output: {
        filePath: 'output.txt',
      },
      ignore: {
        useDefaultPatterns: true,
        customPatterns: ['custom-pattern'],
      },
    });

    const patterns = await getIgnorePatterns('/test/dir', mockConfig);

    // Should include output file
    expect(patterns).toContain('output.txt');
    // Should include default patterns
    expect(patterns).toContain('**/node_modules/**');
    // Should include custom patterns
    expect(patterns).toContain('custom-pattern');
  });
});

describe('parseIgnoreContent', () => {
  it('should parse basic ignore patterns', () => {
    const content = `
        # Comment
        node_modules
        *.log

        .DS_Store
      `;

    const patterns = parseIgnoreContent(content);
    expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
  });

  it('should handle empty content', () => {
    expect(parseIgnoreContent('')).toEqual([]);
  });

  it('should handle content with only comments', () => {
    const content = `
        # Comment 1
        # Comment 2
        # Comment 3
      `;

    expect(parseIgnoreContent(content)).toEqual([]);
  });

  it('should handle mixed line endings', () => {
    const content = 'pattern1\r\npattern2\npattern3\rpattern4';
    const patterns = parseIgnoreContent(content);
    expect(patterns).toEqual(['pattern1', 'pattern2', 'pattern3', 'pattern4']);
  });

  it('should handle patterns with spaces', () => {
    const content = `
        # Comment
        path with spaces
        another path  with  spaces
        *.log
      `;

    const patterns = parseIgnoreContent(content);
    expect(patterns).toEqual(['path with spaces', 'another path  with  spaces', '*.log']);
  });

  it('should ignore empty lines', () => {
    const content = `
        pattern1

        pattern2

        pattern3
      `;

    const patterns = parseIgnoreContent(content);
    expect(patterns).toEqual(['pattern1', 'pattern2', 'pattern3']);
  });
});

describe('searchFiles - Complex Scenarios', () => {
  it('should handle complex gitignore patterns', async () => {
    const mockConfig = createMockConfig({
      ignore: {
        useGitignore: true,
        customPatterns: [],
      },
    });

    // Mock .gitignore content with complex patterns
    vi.mocked(fs.readFile).mockResolvedValue(`
        # Node
        node_modules/

        # Build
        dist/
        build/

        # Logs
        *.log
        logs/

        # IDEs
        .idea/
        .vscode/

        # OS
        .DS_Store
        Thumbs.db

        # Specific files
        config.local.js
        !config.example.js
      `);

    vi.mocked(globby).mockResolvedValue([
      'src/index.js',
      'config.example.js',
      'src/components/Button.jsx',
    ]);

    const result = await searchFiles('/test/dir', mockConfig);

    expect(result).toEqual([
      'config.example.js',
      'src/components/Button.jsx',
      'src/index.js',
    ]);
  });

  it('should handle nested repofmignore files', async () => {
    const mockConfig = createMockConfig({
      include: ['**/*'],
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
      },
    });

    // Mock root .repofmignore
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path.toString().endsWith('/.repofmignore')) {
        return 'root-ignored/';
      }
      return '';
    });

    vi.mocked(globby).mockResolvedValue([
      'src/index.js',
      'src/components/Button.jsx',
      'root-ignored/file.js',
    ]);

    const result = await searchFiles('/test/dir', mockConfig);

    expect(result).not.toContain('root-ignored/file.js');
    expect(result).toContain('src/index.js');
    expect(result).toContain('src/components/Button.jsx');
  });

  it('should handle include patterns with negation', async () => {
    const mockConfig = createMockConfig({
      include: ['**/*.js', '!**/*.test.js'],
      ignore: {
        useGitignore: true,
      },
    });

    vi.mocked(globby).mockResolvedValue([
      'src/index.js',
      'src/utils.js',
      'src/utils.test.js',
      'tests/index.test.js',
    ]);

    const result = await searchFiles('/test/dir', mockConfig);

    expect(result).toContain('src/index.js');
    expect(result).toContain('src/utils.js');
    expect(result).not.toContain('src/utils.test.js');
    expect(result).not.toContain('tests/index.test.js');
  });

  it('should handle large directory structures', async () => {
    const mockConfig = createMockConfig();
    const mockFiles = Array.from({ length: 1000 }, (_, i) =>
      `src/module${Math.floor(i / 10)}/component${i}.js`
    );

    vi.mocked(globby).mockResolvedValue(mockFiles);
    vi.mocked(fs.stat).mockResolvedValue({
      isFile: () => true,
    } as fs.Stats);

    const result = await searchFiles('/test/dir', mockConfig);

    expect(result).toHaveLength(1000);
    expect(result).toBeSorted(); // Verify files are sorted
  });

  it('should handle file permission errors gracefully', async () => {
    const mockConfig = createMockConfig();

    vi.mocked(globby).mockImplementation(() => {
      throw new Error('EPERM: permission denied');
    });

    await expect(searchFiles('/test/dir', mockConfig)).rejects.toThrow(PermissionError);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle network paths', async () => {
    const mockConfig = createMockConfig();
    const networkPath = process.platform === 'win32'
      ? '\\\\server\\share\\folder'
      : '/mnt/network/folder';

    vi.mocked(fs.stat).mockResolvedValue({
      isFile: () => true,
    } as fs.Stats);

    vi.mocked(globby).mockResolvedValue([
      'file1.js',
      'file2.js',
    ]);

    await searchFiles(networkPath, mockConfig);

    expect(globby).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        cwd: networkPath,
      }),
    );
  });

  it('should handle errors during gitignore parsing', async () => {
    const mockConfig = createMockConfig({
      ignore: {
        useGitignore: true,
      },
    });

    vi.mocked(fs.readFile).mockRejectedValue(new Error('Failed to read gitignore'));
    vi.mocked(globby).mockResolvedValue(['file1.js', 'file2.js']);

    const result = await searchFiles('/test/dir', mockConfig);

    expect(result).toEqual(['file1.js', 'file2.js']);
    expect(logger.warn).toHaveBeenCalled();
  });
});
});

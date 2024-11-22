import * as fs from 'node:fs/promises';
import path from 'node:path';
import clipboardy from 'clipboardy';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';
import { pack, type PackDependencies } from '../../src/core/packager.js';
import { type repofmConfigMerged } from '../../src/config/configSchema.js';
import { TokenCounter } from '../../src/core/tokenCount/tokenCount.js';
import { createMockConfig } from '../testing/testUtils.js';
import type { SecurityIssue } from '../../src/core/security/securityCheck.js';
import type { FileInfo } from '../../src/core/types.js';
import type { ProcessedFile } from '../../src/core/file/fileTypes.js';
import type { SearchConfig } from '../../src/core/file/fileSearch.js';

vi.mock('node:fs/promises');
vi.mock('clipboardy');
vi.mock('../../src/core/tokenCount/tokenCount.js');

describe('packager', () => {
  let mockDeps: PackDependencies & {
    runSecurityCheck: Mock<[FileInfo[]], Promise<SecurityIssue[]>>;
    searchFiles: Mock<[string, Partial<SearchConfig>?], Promise<string[]>>;
    processFiles: Mock<[FileInfo[], repofmConfigMerged], Promise<ProcessedFile[]>>;
    collectFiles: Mock<[string[], repofmConfigMerged], Promise<FileInfo[]>>;
  };
  let tokenCounterInstance: {
    addFile: Mock<[string, string], Promise<void>>;
    getTotal: Mock<[], Promise<number>>;
    free: Mock<[], void>;
    countTokens: Mock<[string], Promise<number>>;
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Use consistent path handling
    const file1Path = path.join('file1.txt');
    const file2Path = path.join('dir1', 'file2.txt');
    const normalizedPaths = [file1Path, file2Path];
    
    const rawFiles: FileInfo[] = [
      { path: file1Path, content: 'raw content 1', size: 0 },
      { path: file2Path, content: 'raw content 2', size: 0 },
    ];
    const processedFiles: ProcessedFile[] = [
      { path: file1Path, content: 'processed content 1' },
      { path: file2Path, content: 'processed content 2' },
    ];

    tokenCounterInstance = {
      addFile: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
      getTotal: vi.fn<[], Promise<number>>().mockResolvedValue(100),
      free: vi.fn<[], void>(),
      countTokens: vi.fn<[string], Promise<number>>().mockResolvedValue(100),
    };

    const runSecurityCheckMock = vi.fn<[FileInfo[]], Promise<SecurityIssue[]>>();
    mockDeps = {
      searchFiles: vi.fn<[string, Partial<SearchConfig>?], Promise<string[]>>(),
      collectFiles: vi.fn<[string[], repofmConfigMerged], Promise<FileInfo[]>>(),
      processFiles: vi.fn<[FileInfo[], repofmConfigMerged], Promise<ProcessedFile[]>>(),
      runSecurityCheck: runSecurityCheckMock,
      generateOutput: vi.fn<[string, repofmConfigMerged, ProcessedFile[], string[]], Promise<string>>(),
    };

    // Set up default mock implementations
    mockDeps.searchFiles.mockResolvedValue(normalizedPaths);
    mockDeps.collectFiles.mockResolvedValue(rawFiles);
    mockDeps.processFiles.mockResolvedValue(processedFiles);
    mockDeps.runSecurityCheck.mockResolvedValue([]);
    mockDeps.generateOutput.mockResolvedValue('mock output');

    vi.mocked(TokenCounter).mockImplementation(() => tokenCounterInstance as any);
  });

  test('pack should process files and generate output', async () => {
    const mockConfig = createMockConfig({}, {});
    const expectedFiles = [
      { path: 'file1.txt', content: 'processed content 1', size: 0 },
      { path: 'dir1/file2.txt', content: 'processed content 2', size: 0 }
    ];

    const mockDeps = {
      searchFiles: vi.fn().mockResolvedValue(['file1.txt', 'dir1/file2.txt']),
      processFiles: vi.fn().mockResolvedValue(expectedFiles),
      generateOutput: vi.fn().mockResolvedValue('test output'),
      writeOutput: vi.fn().mockResolvedValue(undefined),
      runSecurityCheck: vi.fn().mockResolvedValue([]),
      countTokens: vi.fn().mockResolvedValue(100)
    };

    const result = await pack('root', mockConfig, undefined, mockDeps);

    // Verify output generation and writing
    expect(mockDeps.generateOutput).toHaveBeenCalledWith(
      path.resolve('root'),
      mockConfig,
      expectedFiles
    );

    // Verify result statistics
    expect(result).toEqual({
      totalFiles: 2,
      totalCharacters: 38,
      totalTokens: 200,
      fileCharCounts: {
        'file1.txt': 19,
        'dir1/file2.txt': 19
      },
      fileTokenCounts: {
        'file1.txt': 100,
        'dir1/file2.txt': 100
      },
      suspiciousFilesResults: []
    });
  });

  test('pack should handle empty file list', async () => {
    const mockConfig = createMockConfig({}, {});
    const mockDeps = {
      searchFiles: vi.fn().mockResolvedValue([]),
      processFiles: vi.fn().mockResolvedValue([]),
      generateOutput: vi.fn().mockResolvedValue(''),
      writeOutput: vi.fn().mockResolvedValue(undefined),
      runSecurityCheck: vi.fn().mockResolvedValue([]),
      countTokens: vi.fn().mockResolvedValue(0)
    };

    const result = await pack('root', mockConfig, undefined, mockDeps);

    expect(result).toEqual({
      totalFiles: 0,
      totalCharacters: 0,
      totalTokens: 0,
      fileCharCounts: {},
      fileTokenCounts: {},
      suspiciousFilesResults: []
    });
  });

  test('pack should handle progress callback', async () => {
    const mockConfig = createMockConfig({}, {});
    const mockDeps = {
      searchFiles: vi.fn().mockResolvedValue(['file1.txt']),
      processFiles: vi.fn().mockResolvedValue([{ path: 'file1.txt', content: 'test', size: 0 }]),
      generateOutput: vi.fn().mockResolvedValue('test'),
      writeOutput: vi.fn().mockResolvedValue(undefined),
      runSecurityCheck: vi.fn().mockResolvedValue([]),
      countTokens: vi.fn().mockResolvedValue(100)
    };

    const progressMessages: string[] = [];
    await pack('root', mockConfig, (msg) => progressMessages.push(msg), mockDeps);

    expect(progressMessages).toEqual([
      'Starting file search...',
      'Searching for files...',
      'Processing files...',
      'Running security checks...',
      'Generating output...',
      'Writing output file...'
    ]);
    expect(progressMessages.length).toBe(6);
  });

  test('pack should handle security check and filter out suspicious files', async () => {
    const mockConfig = createMockConfig({
      security: {
        enableSecurityCheck: true,
      },
    });

    const file1Path = path.join('file1.txt');
    const file2Path = path.join('dir1', 'file2.txt');
    const suspiciousFile = path.join('suspicious.txt');
    
    const suspiciousResult: SecurityIssue = {
      filePath: suspiciousFile,
      messages: ['Potentially malicious content'],
      severity: 'high',
    };

    const files = [
      { path: file1Path, content: 'safe content 1', size: 0 },
      { path: file2Path, content: 'safe content 2', size: 0 },
      { path: suspiciousFile, content: 'suspicious content', size: 0 },
    ];
    mockDeps.searchFiles.mockResolvedValueOnce([file1Path, file2Path, suspiciousFile]);
    mockDeps.collectFiles.mockResolvedValueOnce(files);
    mockDeps.runSecurityCheck.mockResolvedValueOnce([suspiciousResult]);

    const result = await pack('root', mockConfig, () => {}, mockDeps);

    // Verify security check was performed
    expect(mockDeps.runSecurityCheck).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ path: file1Path }),
        expect.objectContaining({ path: file2Path }),
        expect.objectContaining({ path: suspiciousFile }),
      ])
    );

    // Verify suspicious files were filtered out
    expect(mockDeps.processFiles).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ path: file1Path }),
        expect.objectContaining({ path: file2Path }),
      ]),
      expect.any(Object)
    );
    expect(mockDeps.processFiles).not.toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ path: suspiciousFile }),
      ]),
      expect.any(Object)
    );

    // Verify suspicious files are reported in result
    expect(result.suspiciousFilesResults).toEqual([suspiciousResult]);
    expect(result.totalFiles).toBe(2); // Only safe files counted
  });

  test('pack should handle file collection errors gracefully', async () => {
    const mockConfig = createMockConfig();
    const errorMessage = 'Failed to read file';
    const error = new Error(errorMessage);
    
    mockDeps.collectFiles.mockRejectedValueOnce(error);

    await expect(pack('root', mockConfig, () => {}, mockDeps))
      .rejects
      .toThrow(error);
  });

  test('pack should handle output generation errors', async () => {
    const mockConfig = createMockConfig();
    const errorMessage = 'Failed to generate output';
    const error = new Error(errorMessage);
    
    mockDeps.generateOutput.mockRejectedValueOnce(error);

    await expect(pack('root', mockConfig, () => {}, mockDeps))
      .rejects
      .toThrow(error);
  });

  test('pack should respect ignore patterns in config', async () => {
    const mockConfig = createMockConfig({
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
        customPatterns: ['*.log', 'temp/*'],
      },
    });

    await pack('root', mockConfig, () => {}, mockDeps);

    expect(mockDeps.searchFiles).toHaveBeenCalledWith('root', expect.objectContaining({
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
        customPatterns: expect.arrayContaining(['*.log', 'temp/*']),
      },
    }));
  });

  test('pack should skip security check when disabled', async () => {
    const mockConfig = createMockConfig({
      security: {
        enableSecurityCheck: false,
      },
    });

    const result = await pack('root', mockConfig, () => {}, mockDeps);

    expect(mockDeps.runSecurityCheck).not.toHaveBeenCalled();
    expect(result.suspiciousFilesResults).toEqual([]);
    expect(result.totalFiles).toBe(2); // All files should be included
  });

  test('pack should perform security check when enabled', async () => {
    const mockConfig = createMockConfig({
      security: {
        enableSecurityCheck: true,
      },
    });

    const suspiciousFile: SecurityIssue = {
      filePath: 'suspicious.txt',
      messages: ['Suspicious content detected'],
      severity: 'high',
    };
    vi.mocked(mockDeps.runSecurityCheck).mockResolvedValue([suspiciousFile]);

    const result = await pack('root', mockConfig, () => {}, mockDeps);

    expect(mockDeps.runSecurityCheck).toHaveBeenCalled();
    expect(result.suspiciousFilesResults).toEqual([suspiciousFile]);
    expect(result.totalFiles).toBe(2); // All files should still be included in the result
  });

  test('pack should copy to clipboard when enabled', async () => {
    const mockConfig = createMockConfig({
      output: {
        copyToClipboard: true,
      },
    });

    const output = 'Generated output content';
    mockDeps.generateOutput.mockResolvedValueOnce(output);

    await pack('root', mockConfig, () => {}, mockDeps);

    expect(clipboardy.write).toHaveBeenCalledWith(output);
  });

  test('pack should not copy to clipboard when disabled', async () => {
    const mockConfig = createMockConfig({
      output: {
        copyToClipboard: false,
      },
    });

    await pack('root', mockConfig, () => {}, mockDeps);

    expect(clipboardy.write).not.toHaveBeenCalled();
  });

  describe('Security checks', () => {
    test('should handle suspicious files', async () => {
      const mockConfig = createMockConfig({}, {});
      const file1Path = path.join('file1.txt');
      const file2Path = path.join('file2.txt');
      const suspiciousFile = path.join('suspicious.txt');
      const suspiciousResult: SecurityIssue = {
        filePath: suspiciousFile,
        messages: ['Potentially malicious content'],
        severity: 'high',
      };

      const files: FileInfo[] = [
        { path: file1Path, content: 'test content 1', size: 0 },
        { path: file2Path, content: 'test content 2', size: 0 },
        { path: suspiciousFile, content: 'suspicious content', size: 0 },
      ];

      const searchFilesMock = vi.fn<[string, Partial<SearchConfig>?], Promise<string[]>>();
      const collectFilesMock = vi.fn<[string[], repofmConfigMerged], Promise<FileInfo[]>>();
      const runSecurityCheckMock = vi.fn<[FileInfo[]], Promise<SecurityIssue[]>>();

      searchFilesMock.mockResolvedValue([file1Path, file2Path, suspiciousFile]);
      collectFilesMock.mockResolvedValue(files);
      runSecurityCheckMock.mockResolvedValue([suspiciousResult]);

      const testMockDeps: PackDependencies & {
        runSecurityCheck: Mock<[FileInfo[]], Promise<SecurityIssue[]>>;
        searchFiles: Mock<[string, Partial<SearchConfig>?], Promise<string[]>>;
        processFiles: Mock<[FileInfo[], repofmConfigMerged], Promise<ProcessedFile[]>>;
        collectFiles: Mock<[string[], repofmConfigMerged], Promise<FileInfo[]>>;
      } = {
        ...mockDeps,
        searchFiles: searchFilesMock,
        collectFiles: collectFilesMock,
        runSecurityCheck: runSecurityCheckMock,
      };

      const result = await pack('root', mockConfig, () => {}, testMockDeps);

      expect(result.suspiciousFilesResults).toEqual([suspiciousResult]);
      expect(testMockDeps.runSecurityCheck).toHaveBeenCalledWith(files);
    });

    test('should handle security check errors', async () => {
      const mockConfig = createMockConfig({}, {});
      const error = new Error('Security check failed');

      mockDeps.runSecurityCheck.mockRejectedValueOnce(error);

      await expect(pack('root', mockConfig, () => {}, mockDeps)).rejects.toThrow(error);
    });
  });
});

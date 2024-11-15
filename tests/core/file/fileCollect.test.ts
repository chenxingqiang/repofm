import * as fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { collectFiles } from '../../../src/core/file/fileCollect.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('node:fs/promises');
vi.mock('istextorbinary');
vi.mock('jschardet');
vi.mock('iconv-lite');
vi.mock('../../../src/shared/logger');

describe('fileCollect', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should collect non-binary files', async () => {
    const mockFilePaths = ['file1.txt', 'file2.txt'];
    const mockRootDir = '/root';

    vi.mocked(isBinary).mockReturnValue(false);
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('file content'));
    vi.mocked(jschardet.detect).mockReturnValue({ encoding: 'utf-8', confidence: 0.99 });
    vi.mocked(iconv.decode).mockReturnValue('decoded content');

    const result = await collectFiles(mockFilePaths, mockRootDir);

    expect(result).toEqual([
      { path: 'file1.txt', content: 'decoded content' },
      { path: 'file2.txt', content: 'decoded content' },
    ]);
  });

  it('should skip binary files', async () => {
    const mockFilePaths = ['binary.bin', 'text.txt'];
    const mockRootDir = '/root';

    vi.mocked(isBinary).mockReturnValueOnce(true).mockReturnValueOnce(false);
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('file content'));
    vi.mocked(jschardet.detect).mockReturnValue({ encoding: 'utf-8', confidence: 0.99 });
    vi.mocked(iconv.decode).mockReturnValue('decoded content');

    const result = await collectFiles(mockFilePaths, mockRootDir);

    expect(result).toEqual([{ path: 'text.txt', content: 'decoded content' }]);
    expect(logger.debug).toHaveBeenCalledWith(`Skipping binary file: ${path.resolve('/root/binary.bin')}`);
  });

  it('should handle file read errors', async () => {
    const mockFilePaths = ['error.txt'];
    const mockRootDir = '/root';

    vi.mocked(isBinary).mockReturnValue(false);
    vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

    const result = await collectFiles(mockFilePaths, mockRootDir);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      `Failed to read file: ${path.resolve('/root/error.txt')}`,
      expect.any(Error),
    );
  });
});


// tests/core/file/fileCollect.test.ts

vi.mock('node:fs/promises');
vi.mock('istextorbinary');
vi.mock('jschardet');
vi.mock('iconv-lite');
vi.mock('../../../src/shared/logger');

describe('fileCollect', () => {
  const mockRootDir = '/test/dir';
  const mockFiles = {
    'test.txt': 'UTF-8 content',
    'test-gb2312.txt': Buffer.from('GB2312 content'),
    'test.bin': Buffer.from([0x00, 0x01, 0x02, 0x03]),
    'test-empty.txt': '',
    'test-large.txt': 'x'.repeat(1024 * 1024), // 1MB file
    'test-permission.txt': 'Permission denied content',
    'test-corrupted.txt': Buffer.from([0xFF, 0xFE, 0x00]),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    setupMocks();
  });

  function setupMocks() {
    // Mock file reading
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      const fileName = path.basename(filePath as string);
      const content = mockFiles[fileName as keyof typeof mockFiles];
      if (fileName === 'test-permission.txt') {
        throw new Error('EACCES: permission denied');
      }
      if (content === undefined) {
        throw new Error('ENOENT: file not found');
      }
      return Buffer.from(content);
    });

    // Mock binary detection
    vi.mocked(isBinary).mockImplementation((filePath, buffer) => {
      if (typeof filePath === 'string' && filePath.endsWith('.bin')) {
        return true;
      }
      return buffer instanceof Buffer && buffer[0] === 0x00;
    });

    // Mock character detection
    vi.mocked(jschardet.detect).mockImplementation((buffer) => {
      if (buffer instanceof Buffer && buffer[0] === 0xFF) {
        return { encoding: null, confidence: 0 };
      }
      const fileName = Array.from(Object.entries(mockFiles)).find(
        ([, content]) => content === buffer || (buffer instanceof Buffer && content instanceof Buffer && buffer.equals(content))
      )?.[0];
      return {
        encoding: fileName?.includes('gb2312') ? 'gb2312' : 'utf-8',
        confidence: 0.99,
      };
    });

    // Mock character decoding
    vi.mocked(iconv.decode).mockImplementation((buffer, encoding) => {
      if (encoding === 'gb2312') {
        return 'Decoded GB2312 content';
      }
      return buffer.toString();
    });
  }

  it('should collect non-binary files with correct encoding detection', async () => {
    const filePaths = ['test.txt', 'test-gb2312.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toEqual([
      { path: 'test.txt', content: 'UTF-8 content' },
      { path: 'test-gb2312.txt', content: 'Decoded GB2312 content' },
    ]);
  });

  it('should skip binary files', async () => {
    const filePaths = ['test.txt', 'test.bin'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('test.txt');
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Skipping binary file'));
  });

  it('should handle empty files', async () => {
    const filePaths = ['test-empty.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('');
  });

  it('should handle large files', async () => {
    const filePaths = ['test-large.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(1);
    expect(result[0].content.length).toBe(1024 * 1024);
  });

  it('should handle permission errors', async () => {
    const filePaths = ['test-permission.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(0);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to read file'),
      expect.any(Error)
    );
  });

  it('should handle corrupted files', async () => {
    const filePaths = ['test-corrupted.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(1);
    // Should still try to decode with UTF-8 as fallback
    expect(result[0].content).toBeTruthy();
  });

  it('should process files concurrently', async () => {
    const filePaths = Array(100).fill('test.txt');
    const startTime = Date.now();
    await collectFiles(filePaths, mockRootDir);
    const endTime = Date.now();

    // Processing time should be reasonable for concurrent operations
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should handle files with different line endings', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from('line1\r\nline2\nline3\rline4'));
    const filePaths = ['test-endings.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(1);
    expect(result[0].content).toContain('\r\n');
    expect(result[0].content).toContain('\n');
    expect(result[0].content).toContain('\r');
  });

  it('should handle network paths', async () => {
    const networkPath = isWindows ? '\\\\server\\share\\file.txt' : '/mnt/server/file.txt';
    vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from('network content'));
    const filePaths = [networkPath];
    const result = await collectFiles([networkPath], mockRootDir);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe(networkPath);
  });

  it('should handle symbolic links', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from('symlink content'));
    const filePaths = ['test-link.txt'];
    const result = await collectFiles(filePaths, mockRootDir);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('symlink content');
  });
});

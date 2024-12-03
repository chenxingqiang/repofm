import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectFiles } from '../../../src/core/file/fileCollect';
import { logger } from '../../../src/shared/logger';
import * as fs from 'fs/promises';
import path from 'path';

// Mock the logger
vi.mock('../../../src/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn()
  }
}));

// Mock fs promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  access: vi.fn(),
  stat: vi.fn()
}));

describe('fileCollect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all mocks to their default behavior
    vi.mocked(logger.error).mockImplementation(() => {});
    vi.mocked(logger.warn).mockImplementation(() => {});
    vi.mocked(logger.info).mockImplementation(() => {});
    vi.mocked(logger.debug).mockImplementation(() => {});
    vi.mocked(logger.trace).mockImplementation(() => {});
    
    // Setup default fs mock implementations
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('test content'));
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.stat).mockResolvedValue({
      isFile: () => true,
      size: 1000
    } as any);
  });

  it('collects multiple files successfully', async () => {
    const files = {
      'file1.txt': 'content1',
      'file2.txt': 'content2',
      'file3.txt': 'content3'
    };

    vi.mocked(fs.readFile).mockImplementation((filePath) => {
      const fileName = path.basename(filePath as string);
      return Promise.resolve(Buffer.from(files[fileName]));
    });

    vi.mocked(fs.stat).mockImplementation((filePath) => {
      const fileName = path.basename(filePath as string);
      return Promise.resolve({ isFile: () => true, size: files[fileName].length } as any);
    });

    const results = await collectFiles(Object.keys(files));

    expect(results).toHaveLength(3);
    for (let i = 0; i < results.length; i++) {
      const name = path.basename(results[i].path);
      expect(results[i].content).toBe(files[name]);
      expect(results[i].size).toBe(files[name].length);
    }
  });

  it('skips binary files', async () => {
    const filePath = 'test.bin';
    
    // Mock binary file content
    vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from([0, 1, 2, 3]));
    
    const results = await collectFiles([filePath]);
    
    expect(results).toHaveLength(0);
    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Skipping binary file'),
      expect.any(String)
    );
  });

  it('handles empty files', async () => {
    const filePath = 'empty.txt';
    
    // Mock empty file content
    vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from(''));
    vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true, size: 0 } as any);
    
    const results = await collectFiles([filePath]);
    
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      path: filePath,
      content: '',
      size: 0
    });
  });

  it('ignores errors when configured', async () => {
    const validPath = 'valid.txt';
    const errorPath = 'error.txt';
    
    // Mock successful read
    vi.mocked(fs.readFile).mockImplementationOnce(async () => 'valid content');
    
    // Mock failed read
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Test error'));
    
    const results = await collectFiles([validPath, errorPath], { ignoreErrors: true });
    
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe(validPath);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error reading file'),
      expect.any(String)
    );
  });

  // ... other tests remain the same ...
});

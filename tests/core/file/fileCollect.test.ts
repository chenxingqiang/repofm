import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';
import { collectFiles } from '../../../src/core/file/fileCollect.js';
import { createTempDir, removeTempDir } from '../../testing/testUtils.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('istextorbinary');
vi.mock('jschardet');
vi.mock('iconv-lite');
vi.mock('../../../src/shared/logger.js');

describe('fileCollect', () => {
  let tempDir: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    tempDir = await createTempDir();

    // Default mocks
    vi.mocked(isBinary).mockImplementation((filename, buffer) => {
        return false;
    });
    vi.mocked(jschardet.detect).mockReturnValue({
        encoding: 'utf-8',
        confidence: 1.0
    });
    vi.mocked(iconv.decode).mockImplementation((buffer) => buffer.toString());
    vi.mocked(logger.debug).mockImplementation(() => undefined);
    vi.mocked(logger.error).mockImplementation(() => undefined);
    vi.mocked(logger.warn).mockImplementation(() => undefined);
    vi.mocked(logger.trace).mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await removeTempDir(tempDir);
  });

  test('collects multiple files successfully', async () => {
    const files = {
      'test1.txt': 'Content 1',
      'test2.txt': 'Content 2'
    };

    for (const [name, content] of Object.entries(files)) {
      const filePath = path.join(tempDir, name);
      await fs.writeFile(filePath, content);
    }

    const filePaths = Object.keys(files).map(name => path.join(tempDir, name));
    const results = await collectFiles(filePaths);

    expect(results).toHaveLength(2);
    for (let i = 0; i < results.length; i++) {
      const name = path.basename(results[i].path);
      expect(results[i].content).toBe(files[name]);
      expect(results[i].size).toBe(files[name].length);
    }
  });

  test('skips binary files', async () => {
    const filePath = path.join(tempDir, 'test.bin');
    await fs.writeFile(filePath, Buffer.from([0x00, 0x01, 0x02, 0x03]));

    vi.mocked(isBinary).mockImplementation((filename, buffer) => {
        return true;
    });

    const results = await collectFiles([filePath]);
    expect(results).toHaveLength(0);
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Skipping binary file'));
  });

  test('handles empty files', async () => {
    const filePath = path.join(tempDir, 'empty.txt');
    await fs.writeFile(filePath, '');

    const results = await collectFiles([filePath]);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      path: filePath,
      content: '',
      size: 0
    });
  });

  test('handles different encodings', async () => {
    const filePath = path.join(tempDir, 'encoded.txt');
    const content = 'Hello, ';
    await fs.writeFile(filePath, content);

    vi.mocked(jschardet.detect).mockReturnValue({
        encoding: 'utf-8',
        confidence: 1.0
    });
    vi.mocked(iconv.decode).mockReturnValue(content);

    const results = await collectFiles([filePath]);

    expect(results).toHaveLength(1);
    expect(results[0].content).toBe(content);
  });

  test('ignores errors when configured', async () => {
    const validPath = path.join(tempDir, 'valid.txt');
    await fs.writeFile(validPath, 'valid content');

    const invalidPath = path.join(tempDir, 'invalid.txt');

    const results = await collectFiles(
      [invalidPath, validPath],
      { ignoreErrors: true }
    );

    expect(results).toHaveLength(1);
    expect(results[0].path).toBe(validPath);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error reading file'),
      expect.any(String)
    );
  });

  test('throws error when not ignoring errors', async () => {
    const invalidPath = path.join(tempDir, 'nonexistent.txt');

    await expect(collectFiles([invalidPath])).rejects.toThrow();
  });

  test('preserves file order', async () => {
    const files = {
      'c.txt': 'c',
      'a.txt': 'a',
      'b.txt': 'b'
    };

    for (const [name, content] of Object.entries(files)) {
      await fs.writeFile(path.join(tempDir, name), content);
    }

    const filePaths = ['c.txt', 'a.txt', 'b.txt'].map(name => path.join(tempDir, name));
    const results = await collectFiles(filePaths);

    expect(results).toHaveLength(3);
    expect(results.map(r => path.basename(r.path))).toEqual(['c.txt', 'a.txt', 'b.txt']);
  });

  test('handles files with special characters in path', async () => {
    const fileName = 'special!@#$%^&()_+.txt';
    const filePath = path.join(tempDir, fileName);
    const content = 'special content';
    
    await fs.writeFile(filePath, content);

    const results = await collectFiles([filePath]);

    expect(results).toHaveLength(1);
    expect(results[0].path).toBe(filePath);
    expect(results[0].content).toBe(content);
  });

  test('handles files with zero permissions', async () => {
    const filePath = path.join(tempDir, 'noperm.txt');
    await fs.writeFile(filePath, 'content');
    await fs.chmod(filePath, 0o000);

    await expect(collectFiles([filePath])).rejects.toThrow();

    // Restore permissions for cleanup
    await fs.chmod(filePath, 0o666);
  });
});

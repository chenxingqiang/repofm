import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { searchFiles } from '../../src/core/fileSearch.js';
import type { Config } from '../../src/types/config.js';

describe('File Processing Performance Tests', () => {
  const testDir = path.join(__dirname, 'perf_test_files');
  const NUM_FILES = 10000;
  const FILE_SIZE = 1024; // 1KB per file
  
  const baseConfig: Config = {
    include: ['**/*'],
    ignore: {
      excludePatterns: []
    }
  };

  // Create a large number of test files
  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create directory structure with many files
    for (let i = 0; i < NUM_FILES; i++) {
      const depth = Math.floor(Math.random() * 3); // Random depth 0-2
      const dirPath = Array(depth).fill(0).map(() => 
        `dir${Math.floor(Math.random() * 10)}`
      ).join(path.sep);
      
      const fullDirPath = path.join(testDir, dirPath);
      await fs.mkdir(fullDirPath, { recursive: true });
      
      const content = Buffer.alloc(FILE_SIZE).fill('x').toString();
      const fileName = `file${i}.txt`;
      await fs.writeFile(path.join(fullDirPath, fileName), content);
    }
  });

  // Clean up test files
  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should scan 10,000 files within 100ms', async () => {
    const startTime = process.hrtime.bigint();
    
    const files = await searchFiles(testDir, baseConfig);
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    
    expect(files.length).toBe(NUM_FILES);
    expect(duration).toBeLessThan(100); // Should complete within 100ms
  });

  it('should maintain memory usage below 512MB', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    await searchFiles(testDir, baseConfig);
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryUsed = (finalMemory - initialMemory) / (1024 * 1024); // Convert to MB
    
    expect(memoryUsed).toBeLessThan(512);
  });

  it('should handle incremental updates efficiently', async () => {
    // First scan to warm up
    await searchFiles(testDir, baseConfig);
    
    // Add new file
    const newFilePath = path.join(testDir, 'newfile.txt');
    await fs.writeFile(newFilePath, 'new content');
    
    const startTime = process.hrtime.bigint();
    
    const files = await searchFiles(testDir, baseConfig);
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;
    
    expect(files).toContain(newFilePath);
    expect(duration).toBeLessThan(50); // Incremental update should be faster
    
    await fs.unlink(newFilePath);
  });

  it('should handle large files efficiently using streaming', async () => {
    const largeFilePath = path.join(testDir, 'large.txt');
    const largeFileSize = 100 * 1024 * 1024; // 100MB
    
    // Create a large file
    const writeStream = fs.createWriteStream(largeFilePath);
    for (let i = 0; i < largeFileSize / FILE_SIZE; i++) {
      writeStream.write(Buffer.alloc(FILE_SIZE).fill('x'));
    }
    writeStream.end();
    
    const startTime = process.hrtime.bigint();
    
    const files = await searchFiles(testDir, {
      ...baseConfig,
      include: ['**/large.txt']
    });
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;
    
    expect(files).toContain(largeFilePath);
    expect(duration).toBeLessThan(200); // Should handle large file efficiently
    
    await fs.unlink(largeFilePath);
  });
});

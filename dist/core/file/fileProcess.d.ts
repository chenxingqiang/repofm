import { FileInfo } from './fileCollect.js';
export interface ProcessedFile extends FileInfo {
    processedContent: string;
    metadata?: Record<string, unknown>;
}
export interface FileProcessor {
    process(file: FileInfo): Promise<ProcessedFile>;
}
export declare class DefaultFileProcessor implements FileProcessor {
    process(file: FileInfo): Promise<ProcessedFile>;
}
export declare function processFiles(files: FileInfo[], processor?: FileProcessor, concurrency?: number): Promise<ProcessedFile[]>;

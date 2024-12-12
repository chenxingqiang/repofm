export interface FileInfo {
    path: string;
    content: string;
    size: number;
    lastModified: Date;
}
export declare function collectFileInfo(filePath: string): Promise<FileInfo>;
export declare function collectFilesInfo(filePaths: string[]): Promise<FileInfo[]>;

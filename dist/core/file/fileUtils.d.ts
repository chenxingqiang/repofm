export declare function isDirectory(filePath: string): Promise<boolean>;
export declare function isFile(filePath: string): Promise<boolean>;
export declare function exists(filePath: string): Promise<boolean>;
export declare function ensureDir(dirPath: string): Promise<void>;
export declare function normalizePath(filePath: string): string;
export declare function getRelativePath(from: string, to: string): string;
export declare function joinPaths(...paths: string[]): string;
export declare function getFileSize(filePath: string): Promise<number>;
export declare function getModifiedTime(filePath: string): Promise<Date>;

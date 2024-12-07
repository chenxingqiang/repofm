export declare function collectFiles(filePaths: string[], options?: {
    ignoreErrors?: boolean;
}): Promise<{
    path: string;
    content: string;
    size: number;
}[]>;

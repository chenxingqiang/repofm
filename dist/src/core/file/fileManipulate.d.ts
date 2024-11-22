interface FileManipulator {
    removeComments(content: string): string;
    removeEmptyLines(content: string): string;
}
export declare const getFileManipulator: (filePath: string) => FileManipulator | null;
export {};
//# sourceMappingURL=fileManipulate.d.ts.map
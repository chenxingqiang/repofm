export interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    children?: TreeNode[];
}
export declare function generateFileTree(rootPath: string): Promise<TreeNode>;
export declare function treeToString(node: TreeNode, prefix?: string, isRoot?: boolean): string;
export declare function generateTreeString(files: string[]): string;
export declare function generateFileTreeLegacy(files: string[]): TreeNode;

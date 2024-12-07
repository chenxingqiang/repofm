export interface TreeNode {
    name: string;
    children: TreeNode[];
    isDirectory: boolean;
    isRoot?: boolean;
}
export declare function treeToString(node: TreeNode, prefix?: string, isRoot?: boolean): string;
export declare function generateTreeString(files: string[]): string;
export declare function generateFileTree(files: string[]): TreeNode;

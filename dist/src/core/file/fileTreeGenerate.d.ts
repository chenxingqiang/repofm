interface TreeNode {
    name: string;
    children: TreeNode[];
    isDirectory: boolean;
}
export declare const buildTree: (files: string[]) => TreeNode;
export declare const treeToString: (tree: TreeNode, prefix?: string) => string;
export declare const generateFileTree: (files: string[]) => TreeNode;
export declare const generateTreeString: (files: string[]) => string;
export type { TreeNode };
//# sourceMappingURL=fileTreeGenerate.d.ts.map
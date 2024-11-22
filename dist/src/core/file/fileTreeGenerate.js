const createTreeNode = (name, isDirectory) => ({
    name,
    children: [],
    isDirectory,
});
const sortNodes = (nodes) => {
    return [...nodes].sort((a, b) => {
        // Directories before files
        if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
        }
        // Then sort alphabetically, case-insensitive
        return a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    });
};
export const buildTree = (files) => {
    const root = createTreeNode('', true);
    // First normalize all paths and sort them
    const normalizedFiles = files
        .map(file => file.replace(/\\/g, '/'))
        .sort();
    // Process each file
    for (const file of normalizedFiles) {
        const parts = file.split('/').filter(Boolean);
        let currentNode = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;
            let child = currentNode.children.find(c => c.name === part);
            if (!child) {
                child = createTreeNode(part, !isLastPart);
                currentNode.children.push(child);
                currentNode.children = sortNodes(currentNode.children);
            }
            currentNode = child;
        }
    }
    // Sort all nodes recursively at the end
    const sortRecursive = (node) => {
        node.children = sortNodes(node.children);
        node.children.forEach(sortRecursive);
    };
    sortRecursive(root);
    return root;
};
export const treeToString = (tree, prefix = '') => {
    const lines = [];
    const sortedChildren = sortNodes(tree.children);
    for (const child of sortedChildren) {
        const line = prefix + child.name + (child.isDirectory ? '/' : '');
        lines.push(line);
        if (child.isDirectory && child.children.length) {
            const childString = treeToString(child, prefix + '  ');
            if (childString) {
                lines.push(childString);
            }
        }
    }
    return lines.join('\n');
};
export const generateFileTree = (files) => {
    const root = buildTree(files);
    root.name = 'root';
    return root;
};
export const generateTreeString = (files) => {
    if (files.length === 0)
        return '';
    if (files.length === 1 && files[0].endsWith('/'))
        return files[0];
    const normalizedFiles = files.map(f => f.replace(/\\/g, '/'));
    // Build the complete tree with all files
    const tree = buildTree(normalizedFiles);
    // Get the string representation
    const result = treeToString(tree);
    return result;
};
//# sourceMappingURL=fileTreeGenerate.js.map
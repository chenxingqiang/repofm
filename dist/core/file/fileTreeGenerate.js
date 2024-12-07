import { sep } from 'path';
const specialRootOrder = ['package.json', 'root.txt'];
function createNode(name, isDirectory = false, isRoot = false) {
    return {
        name,
        children: [],
        isDirectory,
        isRoot
    };
}
function sortFiles(files) {
    return files.sort((a, b) => {
        // Handle special root files first
        const aIsSpecial = specialRootOrder.indexOf(a);
        const bIsSpecial = specialRootOrder.indexOf(b);
        if (aIsSpecial !== -1 || bIsSpecial !== -1) {
            if (aIsSpecial === -1)
                return 1;
            if (bIsSpecial === -1)
                return -1;
            return aIsSpecial - bIsSpecial;
        }
        // Split paths into segments
        const aParts = a.split(sep);
        const bParts = b.split(sep);
        // Compare each segment
        const minLength = Math.min(aParts.length, bParts.length);
        for (let i = 0; i < minLength; i++) {
            if (aParts[i] !== bParts[i]) {
                // At each level, directories come before files
                const aIsDir = i < aParts.length - 1;
                const bIsDir = i < bParts.length - 1;
                if (aIsDir !== bIsDir)
                    return aIsDir ? -1 : 1;
                // If both are files or both are directories, sort alphabetically
                return aParts[i].localeCompare(bParts[i]);
            }
        }
        // If all segments match up to the shortest path, shorter paths come first
        return aParts.length - bParts.length;
    });
}
function buildTree(files) {
    const root = createNode('root', true, true);
    const sortedFiles = sortFiles(files);
    for (const filePath of sortedFiles) {
        let current = root;
        const parts = filePath.split(sep).filter(Boolean);
        const isDirectory = filePath.endsWith(sep);
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;
            const isDir = isDirectory || !isLastPart;
            let child = current.children.find(c => c.name === part);
            if (!child) {
                child = createNode(part, isDir);
                current.children.push(child);
            }
            // Sort children after adding a new child
            current.children.sort((a, b) => {
                // Special handling for root level
                if (current.isRoot) {
                    const aIsSpecial = specialRootOrder.indexOf(a.name);
                    const bIsSpecial = specialRootOrder.indexOf(b.name);
                    if (aIsSpecial !== -1 || bIsSpecial !== -1) {
                        if (aIsSpecial === -1)
                            return 1;
                        if (bIsSpecial === -1)
                            return -1;
                        return aIsSpecial - bIsSpecial;
                    }
                }
                // Directories come before files, except for index.js which comes after components/
                if (a.isDirectory !== b.isDirectory) {
                    if (b.name === 'index.js' && a.name === 'components')
                        return -1;
                    if (a.name === 'index.js' && b.name === 'components')
                        return 1;
                    if (b.name === 'index.js')
                        return 1;
                    if (a.name === 'index.js')
                        return -1;
                    return a.isDirectory ? -1 : 1;
                }
                // Alphabetical sorting
                return a.name.localeCompare(b.name);
            });
            current = child;
        }
    }
    return root;
}
export function treeToString(node, prefix = '', isRoot = true) {
    if (!isRoot && !node.name)
        return '';
    let result = '';
    if (!isRoot) {
        result = prefix + node.name + (node.isDirectory ? '/' : '');
    }
    if (node.children.length > 0) {
        if (!isRoot)
            result += '\n';
        const childPrefix = isRoot ? '' : prefix + '  ';
        result += node.children
            .map(child => treeToString(child, childPrefix, false))
            .join('\n');
    }
    return result;
}
export function generateTreeString(files) {
    if (files.length === 0)
        return '';
    if (files.length === 1) {
        return files[0] + (files[0].endsWith(sep) ? '' : '');
    }
    const tree = buildTree(files);
    return treeToString(tree);
}
export function generateFileTree(files) {
    return buildTree(files);
}
//# sourceMappingURL=fileTreeGenerate.js.map
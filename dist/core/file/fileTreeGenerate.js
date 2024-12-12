import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../../shared/logger.js';
const specialRootOrder = ['package.json', 'root.txt'];
function createNode(name, path, type, size) {
    return {
        name,
        path,
        type,
        size
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
        const aParts = a.split(path.sep);
        const bParts = b.split(path.sep);
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
    const root = createNode('root', '', 'directory');
    const sortedFiles = sortFiles(files);
    for (const filePath of sortedFiles) {
        let current = root;
        const parts = filePath.split(path.sep).filter(Boolean);
        const isDirectory = filePath.endsWith(path.sep);
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;
            const isDir = isDirectory || !isLastPart;
            let child = current.children?.find(c => c.name === part);
            if (!child) {
                child = createNode(part, path.join(current.path, part), isDir ? 'directory' : 'file');
                if (!current.children)
                    current.children = [];
                current.children.push(child);
            }
            // Sort children after adding a new child
            if (current.children) {
                current.children.sort((a, b) => {
                    // Special handling for root level
                    if (current.name === 'root') {
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
                    if (a.type !== b.type) {
                        if (b.name === 'index.js' && a.name === 'components')
                            return -1;
                        if (a.name === 'index.js' && b.name === 'components')
                            return 1;
                        if (b.name === 'index.js')
                            return 1;
                        if (a.name === 'index.js')
                            return -1;
                        return a.type === 'directory' ? -1 : 1;
                    }
                    // Alphabetical sorting
                    return a.name.localeCompare(b.name);
                });
            }
            current = child;
        }
    }
    return root;
}
export async function generateFileTree(rootPath) {
    try {
        const stats = await fs.stat(rootPath);
        const name = path.basename(rootPath);
        if (!stats.isDirectory()) {
            return {
                name,
                path: rootPath,
                type: 'file',
                size: stats.size
            };
        }
        const entries = await fs.readdir(rootPath);
        const children = await Promise.all(entries.map(async (entry) => {
            const fullPath = path.join(rootPath, entry);
            return generateFileTree(fullPath);
        }));
        return {
            name,
            path: rootPath,
            type: 'directory',
            children
        };
    }
    catch (error) {
        logger.error(`Error generating file tree for ${rootPath}:`, error);
        throw error;
    }
}
export function treeToString(node, prefix = '', isRoot = true) {
    if (!isRoot && !node.name)
        return '';
    let result = '';
    if (!isRoot) {
        result = prefix + node.name + (node.type === 'directory' ? '/' : '');
    }
    if (node.children) {
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
        return files[0] + (files[0].endsWith(path.sep) ? '' : '');
    }
    const tree = buildTree(files);
    return treeToString(tree);
}
export function generateFileTreeLegacy(files) {
    return buildTree(files);
}
//# sourceMappingURL=fileTreeGenerate.js.map
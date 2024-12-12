import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../../shared/logger.js';

const specialRootOrder = ['package.json', 'root.txt'];

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: TreeNode[];
  isDirectory?: boolean;
}

function createNode(name: string, path: string, type: 'file' | 'directory', size?: number): TreeNode {
  return {
    name,
    path,
    type,
    size
  };
}

function sortFiles(files: string[]): string[] {
  return files.sort((a, b) => {
    // Handle special root files first
    const aIsSpecial = specialRootOrder.indexOf(a);
    const bIsSpecial = specialRootOrder.indexOf(b);
    if (aIsSpecial !== -1 || bIsSpecial !== -1) {
      if (aIsSpecial === -1) return 1;
      if (bIsSpecial === -1) return -1;
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
        if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
        
        // If both are files or both are directories, sort alphabetically
        return aParts[i].localeCompare(bParts[i]);
      }
    }
    
    // If all segments match up to the shortest path, shorter paths come first
    return aParts.length - bParts.length;
  });
}

function buildTree(files: string[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '',
    type: 'directory',
    children: [],
    isDirectory: true
  };

  for (const filePath of files) {
    const parts = filePath.split(path.sep).filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLastPart = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join(path.sep);

      // Check if child already exists
      let child = current.children?.find(c => c.name === name);

      if (!child) {
        // Create new child node
        child = {
          name,
          path: fullPath,
          type: isLastPart ? 'file' : 'directory',
          ...(isLastPart ? {} : { children: [], isDirectory: true })
        };

        // Initialize children array if not exists
        if (!current.children) {
          current.children = [];
        }
        current.children.push(child);

        // Sort children alphabetically
        if (current.children) {
          current.children.sort((a, b) => {
            // Directories before files
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }

            // Alphabetical sorting
            return a.name.localeCompare(b.name);
          });
        }
      }

      current = child;
    }
  }

  return root;
}

export async function generateFileTree(rootPath: string | string[]): Promise<TreeNode> {
  // If an array of paths is passed, use buildTree
  if (Array.isArray(rootPath)) {
    // Handle empty input case
    if (rootPath.length === 0) {
      return {
        name: 'root',
        path: '',
        type: 'directory',
        children: [],
        isDirectory: true
      };
    }

    const sortedFiles = sortFiles(rootPath);
    return buildTree(sortedFiles);
  }

  // If a single path is passed, use the existing implementation
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
    const children = await Promise.all(
      entries.map(async entry => {
        const fullPath = path.join(rootPath, entry);
        return generateFileTree(fullPath);
      })
    );

    return {
      name,
      path: rootPath,
      type: 'directory',
      children,
      isDirectory: true
    };
  } catch (error) {
    logger.error(`Error generating file tree for ${rootPath}:`, error);
    throw error;
  }
}

export function treeToString(node: TreeNode, prefix = '', isRoot = true): string {
  // If no children or empty root, return empty string
  if (!node.children || node.children.length === 0) {
    return '';
  }

  // Sort children to ensure consistent output
  const sortedChildren = node.children.sort((a, b) => {
    // Directories come before files
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    // Then sort alphabetically
    return a.name.localeCompare(b.name);
  });

  const lines: string[] = [];

  for (const child of sortedChildren) {
    const childPrefix = prefix + (child.type === 'directory' ? '  ' : '');
    const displayName = child.type === 'directory' ? `${child.name}/` : child.name;

    // Add the current node
    lines.push(`${prefix}${displayName}`);

    // Recursively add children for directories
    if (child.type === 'directory' && child.children) {
      const childLines = treeToString(child, childPrefix, false);
      if (childLines) {
        lines.push(...childLines.split('\n').filter(Boolean));
      }
    }
  }

  // Only return the lines if not the root call
  return isRoot ? lines.join('\n') : lines.join('\n');
}

export function generateTreeString(files: string[]): string {
  // Handle single file or directory case
  if (files.length === 1) {
    const file = files[0];
    return file.endsWith(path.sep) ? file : file + (file.includes(path.sep) ? '' : '/');
  }

  // First, separate special root files
  const specialFiles = files.filter(file => 
    specialRootOrder.includes(path.basename(file))
  );
  
  // Remove special files from the main list
  const otherFiles = files.filter(file => 
    !specialRootOrder.includes(path.basename(file))
  );

  // Generate tree for other files
  const tree = generateFileTreeLegacy(otherFiles);
  const treeString = treeToString(tree);

  // Combine special files with tree string
  const combinedFiles = [
    ...specialFiles.map(file => path.basename(file)),
    ...(treeString ? treeString.split('\n') : [])
  ];

  return combinedFiles.join('\n');
}

export function generateFileTreeLegacy(files: string[]): TreeNode {
  return buildTree(files);
}

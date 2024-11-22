// tests/core/file/fileTreeGenerate.test.ts

import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { generateFileTree, generateTreeString, treeToString } from '../../../src/core/file/fileTreeGenerate.js';

describe('fileTreeGenerate', () => {
    const sep = path.sep;

    describe('generateFileTree', () => {
        test('should generate correct tree structure for flat files', () => {
            const files = ['file1.txt', 'file2.txt'];
            const tree = generateFileTree(files);

            expect(tree.name).toBe('root');
            expect(tree.isDirectory).toBe(true);
            expect(tree.children).toHaveLength(2);
            expect(tree.children.map(child => child.name)).toEqual(['file1.txt', 'file2.txt']);
        });

        test('should generate correct tree structure for nested files', () => {
            const files = [
                'src/index.js',
                'src/utils/helper.js',
                'tests/test.js'
            ];
            const tree = generateFileTree(files);

            expect(tree.name).toBe('root');
            expect(tree.children).toHaveLength(2);
        });

        test('should handle empty input', () => {
            const tree = generateFileTree([]);

            expect(tree.name).toBe('root');
            expect(tree.isDirectory).toBe(true);
            expect(tree.children).toHaveLength(0);
        });
    });

    describe('treeToString', () => {
        test('should generate correct string representation for flat structure', () => {
            const files = [
                'file1.txt',
                'file2.js',
                'file3.css',
            ];

            const tree = generateFileTree(files);
            const result = treeToString(tree);

            const expected = [
                'file1.txt',
                'file2.js',
                'file3.css',
            ].join('\n');

            expect(result).toBe(expected);
        });

        test('should generate correct string representation for nested structure', () => {
            const files = [
                `src${sep}index.js`,
                `src${sep}utils${sep}helper.js`,
                `tests${sep}test.js`,
            ];

            const tree = generateFileTree(files);
            const result = treeToString(tree);

            const expected = [
                'src/',
                '  index.js',
                '  utils/',
                '    helper.js',
                'tests/',
                '  test.js',
            ].join('\n');

            expect(result).toBe(expected);
        });

        test('should handle empty tree', () => {
            const tree = generateFileTree([]);
            const result = treeToString(tree);

            expect(result).toBe('');
        });

        test('should handle deep nesting', () => {
            const files = [
                `a${sep}b${sep}c${sep}d${sep}file.txt`,
            ];

            const tree = generateFileTree(files);
            const result = treeToString(tree);

            const expected = [
                'a/',
                '  b/',
                '    c/',
                '      d/',
                '        file.txt',
            ].join('\n');

            expect(result).toBe(expected);
        });
    });

    describe('generateTreeString', () => {
        test('should generate complete tree string for mixed structure', () => {
            const files = [
                'root.txt',
                `src${sep}index.js`,
                `src${sep}components${sep}Button.jsx`,
                `src${sep}utils${sep}helper.js`,
                `tests${sep}unit${sep}test.js`,
                `tests${sep}integration${sep}test.js`,
                'package.json',
            ];

            const result = generateTreeString(files);

            const expected = [
                'package.json',
                'root.txt',
                'src/',
                '  components/',
                '    Button.jsx',
                '  index.js',
                '  utils/',
                '    helper.js',
                'tests/',
                '  integration/',
                '    test.js',
                '  unit/',
                '    test.js',
            ].join('\n');

            expect(result).toBe(expected);
        });

        test('should sort directories before files', () => {
            const files = [
                'file.txt',
                `dir${sep}file.txt`,
                'another.txt',
            ];

            const result = generateTreeString(files);

            const expected = [
                'dir/',
                '  file.txt',
                'another.txt',
                'file.txt',
            ].join('\n');

            expect(result).toBe(expected);
        });

        test('should sort files alphabetically within directories', () => {
            const files = [
                `dir${sep}c.txt`,
                `dir${sep}a.txt`,
                `dir${sep}b.txt`,
            ];

            const result = generateTreeString(files);

            const expected = [
                'dir/',
                '  a.txt',
                '  b.txt',
                '  c.txt',
            ].join('\n');

            expect(result).toBe(expected);
        });

        test('should handle single file', () => {
            const result = generateTreeString(['file.txt']);
            expect(result).toBe('file.txt');
        });

        test('should handle single directory', () => {
            const result = generateTreeString(['dir/']);
            expect(result).toBe('dir/');
        });
    });
});

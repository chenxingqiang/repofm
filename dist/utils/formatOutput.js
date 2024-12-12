import path from 'node:path';
export function formatFindResults(results, options) {
    const { format, targetDir } = options;
    if (format === 'json') {
        return JSON.stringify(results.map(file => ({
            path: file,
            absolutePath: path.join(targetDir, file)
        })), null, 2);
    }
    // Plain format - just list the files
    return results.join('\n');
}
//# sourceMappingURL=formatOutput.js.map
import { minimatch } from 'minimatch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
export async function searchFiles(directory, config) {
    const results = [];
    const seen = new Set();
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(directory, fullPath);
            if (seen.has(fullPath))
                continue;
            seen.add(fullPath);
            if (entry.isDirectory()) {
                // Check if directory should be ignored
                if (config.ignore.excludePatterns.some(pattern => minimatch(relativePath, pattern))) {
                    continue;
                }
                await walk(fullPath);
            }
            else if (entry.isFile()) {
                // Check if file matches include patterns and doesn't match exclude patterns
                const shouldInclude = config.include.some(pattern => minimatch(relativePath, pattern));
                const shouldExclude = config.ignore.excludePatterns.some(pattern => minimatch(relativePath, pattern));
                if (shouldInclude && !shouldExclude) {
                    results.push(fullPath);
                }
            }
        }
    }
    await walk(directory);
    return results;
}
//# sourceMappingURL=fileSearch.js.map
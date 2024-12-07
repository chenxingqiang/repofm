import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../utils/logger.js';
let cachedVersion = null;
export const getPackageVersion = async (pkgPath) => {
    if (cachedVersion !== null) {
        return cachedVersion;
    }
    try {
        const content = await fs.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(content);
        if (pkg.version === undefined) {
            logger.warn('Version field not found in package.json');
            cachedVersion = 'unknown';
            return 'unknown';
        }
        // Return raw version string without validation
        cachedVersion = String(pkg.version);
        return cachedVersion;
    }
    catch (error) {
        if (error instanceof Error) {
            if ('code' in error && error.code === 'ENOENT') {
                logger.warn('Package.json not found');
            }
            else if ('code' in error && error.code === 'EACCES') {
                logger.error('Permission denied accessing package.json');
            }
            else {
                logger.error('Error reading package.json:', error);
            }
        }
        cachedVersion = 'unknown';
        return 'unknown';
    }
};
export const getPackageJsonPath = () => {
    const dirName = fileURLToPath(new URL('.', import.meta.url));
    return path.resolve(dirName, '../../../package.json');
};
export const getVersion = async () => {
    const pkgPath = getPackageJsonPath();
    return getPackageVersion(pkgPath);
};
export const clearVersionCache = () => {
    cachedVersion = null;
};
export const parsePackageJson = (content) => {
    try {
        return JSON.parse(content);
    }
    catch (error) {
        logger.error(`Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`);
        return {};
    }
};
//# sourceMappingURL=packageJsonParse.js.map
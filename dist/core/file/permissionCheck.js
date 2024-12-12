import * as fs from 'node:fs/promises';
/**
 * Checks if a file exists and is readable
 * @param filePath Path to the file to check
 * @returns Promise<boolean> True if the file is readable, false otherwise
 */
export const checkFilePermissions = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        // Check if it's a regular file
        if (!stats.isFile()) {
            return false;
        }
        // Check if file is readable (user has read permission)
        const mode = stats.mode;
        const userReadable = (mode & 0o400) === 0o400; // Check user read permission
        const groupReadable = (mode & 0o040) === 0o040; // Check group read permission
        const othersReadable = (mode & 0o004) === 0o004; // Check others read permission
        // Verify actual read access
        try {
            await fs.access(filePath, fs.constants.R_OK);
            return userReadable || groupReadable || othersReadable;
        }
        catch {
            return false;
        }
    }
    catch (error) {
        // File doesn't exist or other error occurred
        return false;
    }
};
//# sourceMappingURL=permissionCheck.js.map
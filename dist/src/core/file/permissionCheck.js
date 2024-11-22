var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'node:fs/promises';
/**
 * Checks if a file exists and is readable
 * @param filePath Path to the file to check
 * @returns Promise<boolean> True if the file is readable, false otherwise
 */
export const checkFilePermissions = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield fs.stat(filePath);
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
            yield fs.access(filePath, fs.constants.R_OK);
            return userReadable || groupReadable || othersReadable;
        }
        catch (_a) {
            return false;
        }
    }
    catch (error) {
        // File doesn't exist or other error occurred
        return false;
    }
});
//# sourceMappingURL=permissionCheck.js.map
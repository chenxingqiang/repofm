import { logger } from '../shared/logger.js';
export function validateRequired(value, name) {
    if (value === undefined || value === null || value === '') {
        return {
            message: `${name} is required`,
            code: 'MISSING_REQUIRED_PARAM'
        };
    }
    return null;
}
export function validateEnum(value, allowedValues, name) {
    if (!allowedValues.includes(value)) {
        return {
            message: `${name} must be one of: ${allowedValues.join(', ')}`,
            code: 'INVALID_ENUM_VALUE'
        };
    }
    return null;
}
export function validateTimeRange(value) {
    const pattern = /^\d+[dw]$/; // e.g., 7d, 30d, 2w
    if (!pattern.test(value)) {
        return {
            message: 'Time range must be in format: [number]d or [number]w (e.g., 7d, 2w)',
            code: 'INVALID_TIME_RANGE'
        };
    }
    return null;
}
export function validateGitUrl(url) {
    // Basic pattern for Git URLs (HTTPS or SSH) or owner/repo format
    const patterns = [
        /^https:\/\/[^\s]+\.git$/, // HTTPS URL ending with .git
        /^git@[^\s]+:.+\.git$/, // SSH URL
        /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/ // owner/repo format
    ];
    if (!patterns.some(pattern => pattern.test(url))) {
        return {
            message: 'Invalid Git URL format. Must be a valid HTTPS/SSH Git URL or owner/repo format',
            code: 'INVALID_GIT_URL'
        };
    }
    return null;
}
export function validateFilePath(path) {
    if (path.includes('..')) {
        return {
            message: 'File path cannot contain parent directory references (..)',
            code: 'INVALID_FILE_PATH'
        };
    }
    return null;
}
export function validateOutputFormat(format) {
    const validFormats = ['plain', 'markdown', 'xml'];
    return validateEnum(format, validFormats, 'Output format');
}
export function validateContextType(type) {
    const validTypes = ['function', 'file', 'character'];
    return validateEnum(type, validTypes, 'Context type');
}
export function validateContextDepth(depth) {
    const num = parseInt(depth, 10);
    if (isNaN(num) || num < 1) {
        return {
            message: 'Context depth must be a positive number',
            code: 'INVALID_DEPTH'
        };
    }
    return null;
}
export function throwIfError(error) {
    if (error) {
        logger.error(error.message);
        process.exit(1);
    }
}

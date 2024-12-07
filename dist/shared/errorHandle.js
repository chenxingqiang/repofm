import { z } from 'zod';
import { logger } from './logger.js';
export class repofmError extends Error {
    constructor(message) {
        super(message);
        this.name = 'repofmError';
        Object.setPrototypeOf(this, repofmError.prototype);
    }
}
export class repofmConfigValidationError extends repofmError {
    constructor(message) {
        super(message);
        this.name = 'repofmConfigValidationError';
        Object.setPrototypeOf(this, repofmConfigValidationError.prototype);
    }
}
export function rethrowValidationErrorIfZodError(error, context) {
    if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `[${issue.path.join('.')}] ${issue.message}`).join('\n');
        throw new repofmConfigValidationError(`${context}:\n${issues}`);
    }
    if (error instanceof Error) {
        return;
    }
    throw new Error('Unknown error occurred during validation');
}
export function handleError(error) {
    if (error instanceof repofmError) {
        logger.error(`Error: ${error.message}`);
        logger.debug('Stack trace:', error.stack);
    }
    else if (error instanceof Error) {
        logger.error(`Unexpected error: ${error.message}`);
        logger.debug('Stack trace:', error.stack);
    }
    else if (error === null || error === undefined) {
        logger.error('An unknown error occurred');
    }
    else {
        logger.error('An unknown error occurred');
        logger.debug('Error details:', error);
    }
    if (process.env.npm_package_version) {
        logger.info(`For more information, please visit: https://github.com/chenxingqiang/repofm/issues`);
    }
}
//# sourceMappingURL=errorHandle.js.map
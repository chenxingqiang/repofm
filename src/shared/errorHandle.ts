import { z } from 'zod';
import { logger } from './logger.js';

export class repofmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'repofmError';
  }
}

export class repofmConfigValidationError extends repofmError {
  constructor(message: string) {
    super(message);
    this.name = 'repofmConfigValidationError';
  }
}

export const handleError = (error: unknown): void => {
  if (error instanceof repofmError) {
    logger.error(`Error: ${error.message}`);
  } else if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.debug('Stack trace:', error.stack);
  } else {
    logger.error('An unknown error occurred');
  }

  logger.info('For more help, please visit: https://github.com/chenxingqiang/repo.freeme/issues');
};

export const rethrowValidationErrorIfZodError = (error: unknown, message: string): void => {
  if (error instanceof z.ZodError) {
    const zodErrorText = error.errors.map((err) => `[${err.path.join('.')}] ${err.message}`).join('\n  ');
    throw new repofmConfigValidationError(
      `${message}\n\n  ${zodErrorText}\n\n  Please check the config file and try again.`,
    );
  }
};

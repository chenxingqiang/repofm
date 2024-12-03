import { CLISpinner } from './cliSpinner.js';
import { FallbackSpinner } from './fallbackSpinner.js';
import type { Spinner } from './types/spinner.js';
import { Logger } from '../shared/logger.js';

export function createSpinner(): Spinner {
  try {
    return new CLISpinner();
  } catch (error) {
    const logger = Logger.getInstance();
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn('Using fallback spinner due to missing dependencies:', errorMessage);
    return new FallbackSpinner();
  }
} 
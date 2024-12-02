import { CLISpinner } from './cliSpinner.js';
import { FallbackSpinner } from './fallbackSpinner.js';

export function createSpinner() {
  try {
    return new CLISpinner();
  } catch (error) {
    console.warn('Using fallback spinner due to missing dependencies');
    return new FallbackSpinner();
  }
} 
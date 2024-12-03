import { CLISpinner } from './cliSpinner.js';

export interface Spinner {
  start(text?: string): void;
  stop(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
}

export function createSpinner(): Spinner {
  return {
    start: CLISpinner.start.bind(CLISpinner),
    stop: CLISpinner.stop.bind(CLISpinner),
    succeed: CLISpinner.succeed.bind(CLISpinner),
    fail: CLISpinner.fail.bind(CLISpinner),
  };
}
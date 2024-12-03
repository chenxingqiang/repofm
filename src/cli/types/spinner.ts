export interface SpinnerOptions {
  text?: string;
  color?: string;
  stream?: NodeJS.WriteStream;
}

export interface Spinner {
  start(text?: string): void;
  stop(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  warn(text?: string): void;
  info(text?: string): void;
}

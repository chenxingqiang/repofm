export interface Logger {
  log: (message: string | number) => void;
  error: (message: string | Error, ...args: unknown[]) => void;
  success: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
  debug: (message: string, ...args: unknown[]) => void;
  trace: (message: string) => void;
} 
import chalk from 'chalk';

interface Logger {
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  success: (...args: any[]) => void;
  info: (...args: any[]) => void;
  note: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  trace: (...args: any[]) => void;
  log: (...args: any[]) => void;
  setVerbose: (verbose: boolean) => void;
  setLevel: (level: 'debug' | 'info' | 'warn' | 'error') => void;
}

let isVerbose = false;

function formatArgs(args: any[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    })
    .join(' ');
}

function formatWithColor(color: string, message: string): string {
  return process.env.NODE_ENV === 'test' ? `${color}:${message}` : message;
}

export const logger: Logger = {
  error: (...args: any[]) => {
    const message = formatArgs(args);
    console.error(process.env.NODE_ENV === 'test' ? `RED:${message}` : chalk.red(message));
  },
  warn: (...args: any[]) => {
    const message = formatArgs(args);
    console.log(process.env.NODE_ENV === 'test' ? `YELLOW:${message}` : chalk.yellow(message));
  },
  success: (...args: any[]) => {
    const message = formatArgs(args);
    console.log(process.env.NODE_ENV === 'test' ? `GREEN:${message}` : chalk.green(message));
  },
  info: (...args: any[]) => {
    const message = formatArgs(args);
    console.log(process.env.NODE_ENV === 'test' ? `CYAN:${message}` : chalk.cyan(message));
  },
  note: (...args: any[]) => {
    const message = formatArgs(args);
    console.log(process.env.NODE_ENV === 'test' ? `DIM:${message}` : chalk.dim(message));
  },
  debug: (...args: any[]) => {
    if (isVerbose) {
      const message = formatArgs(args);
      console.log(process.env.NODE_ENV === 'test' ? `BLUE:${message}` : chalk.blue(message));
    }
  },
  trace: (...args: any[]) => {
    if (isVerbose) {
      const message = formatArgs(args);
      console.log(process.env.NODE_ENV === 'test' ? `GRAY:${message}` : chalk.gray(message));
    }
  },
  log: (...args: any[]) => {
    console.log(formatArgs(args));
  },
  setVerbose: (verbose: boolean) => {
    isVerbose = verbose;
  },
  setLevel: (level: 'debug' | 'info' | 'warn' | 'error') => {
    // Implementation to set the level
  },
};

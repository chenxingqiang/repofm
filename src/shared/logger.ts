import pc from 'picocolors';

export class Logger {
  private static instance: Logger | null = null;

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static resetInstance(): void {
    Logger.instance = null;
  }

  private isVerbose = false;

  setVerbose(verbose: boolean): void {
    this.isVerbose = verbose;
  }

  private formatArgs(args: any[]): string {
    return args.map(arg => {
      if (arg instanceof Error) return arg.message;
      if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg);
      return String(arg);
    }).join(' ');
  }

  log(...args: any[]): void {
    console.log(this.formatArgs(args));
  }

  error(...args: any[]): void {
    console.error(pc.red(this.formatArgs(args)));
  }

  success(...args: any[]): void {
    console.log(pc.green(this.formatArgs(args)));
  }

  warn(...args: any[]): void {
    console.log(pc.yellow(this.formatArgs(args)));
  }

  info(...args: any[]): void {
    console.log(pc.cyan(this.formatArgs(args)));
  }

  debug(...args: any[]): void {
    if (this.isVerbose) {
      console.log(pc.blue(this.formatArgs(args)));
    }
  }

  public dim(...args: any[]): void {
    console.log(pc.dim(this.formatArgs(args)));
  }

  note(...args: any[]): void {
    console.log(pc.gray(this.formatArgs(args)));
  }

  trace(...args: any[]): void {
    if (this.isVerbose) {
      console.trace(pc.gray(this.formatArgs(args)));
    }
  }
}

export const logger = new Logger();

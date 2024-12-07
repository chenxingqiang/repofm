import pc from 'picocolors';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export class Logger {
  private static instance: Logger | null = null;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  static resetInstance(): void {
    Logger.instance = null;
  }

  private level: LogLevel = 'info';

  setLevel(newLevel: LogLevel): void {
    this.level = newLevel;
  }

  private shouldLog(currentLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(currentLevel) <= levels.indexOf(this.level);
  }

  private formatArgs(args: any[]): string {
    return args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(pc.red('ERROR:'), this.formatArgs(args));
    }
  }

  success(...args: any[]): void {
    console.log(pc.green('SUCCESS:'), this.formatArgs(args));
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.log(pc.yellow('WARN:'), this.formatArgs(args));
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(pc.cyan('INFO:'), this.formatArgs(args));
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(pc.gray('DEBUG:'), this.formatArgs(args));
    }
  }

  log(...args: any[]): void {
    console.log(this.formatArgs(args));
  }

  trace(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.trace(pc.gray('TRACE:'), this.formatArgs(args));
    }
  }
}

export const logger = Logger.getInstance();

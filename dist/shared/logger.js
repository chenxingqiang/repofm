import pc from 'picocolors';
export class Logger {
    constructor() {
        this.level = 'info';
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    static resetInstance() {
        Logger.instance = null;
    }
    setLevel(newLevel) {
        this.level = newLevel;
    }
    shouldLog(currentLevel) {
        const levels = ['error', 'warn', 'info', 'debug'];
        return levels.indexOf(currentLevel) <= levels.indexOf(this.level);
    }
    formatArgs(args) {
        return args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    }
    error(...args) {
        if (this.shouldLog('error')) {
            console.error(pc.red('ERROR:'), this.formatArgs(args));
        }
    }
    success(...args) {
        console.log(pc.green('SUCCESS:'), this.formatArgs(args));
    }
    warn(...args) {
        if (this.shouldLog('warn')) {
            console.log(pc.yellow('WARN:'), this.formatArgs(args));
        }
    }
    info(...args) {
        if (this.shouldLog('info')) {
            console.log(pc.cyan('INFO:'), this.formatArgs(args));
        }
    }
    debug(...args) {
        if (this.shouldLog('debug')) {
            console.log(pc.gray('DEBUG:'), this.formatArgs(args));
        }
    }
    log(...args) {
        console.log(this.formatArgs(args));
    }
    trace(...args) {
        if (this.shouldLog('debug')) {
            console.trace(pc.gray('TRACE:'), this.formatArgs(args));
        }
    }
}
Logger.instance = null;
export const logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map
import util from 'node:util';
import pc from 'picocolors';
class Logger {
    constructor() {
        this.isVerbose = false;
    }
    setVerbose(value) {
        this.isVerbose = value;
    }
    error(...args) {
        console.error(pc.red(this.formatArgs(args)));
    }
    warn(...args) {
        console.log(pc.yellow(this.formatArgs(args)));
    }
    success(...args) {
        console.log(pc.green(this.formatArgs(args)));
    }
    info(...args) {
        console.log(pc.cyan(this.formatArgs(args)));
    }
    note(...args) {
        console.log(pc.dim(this.formatArgs(args)));
    }
    debug(...args) {
        if (this.isVerbose) {
            console.log(pc.blue(this.formatArgs(args)));
        }
    }
    trace(...args) {
        if (this.isVerbose) {
            console.log(pc.gray(this.formatArgs(args)));
        }
    }
    log(...args) {
        console.log(...args);
    }
    formatArgs(args) {
        return args
            .map((arg) => (typeof arg === 'object' ? util.inspect(arg, { depth: null, colors: true }) : arg))
            .join(' ');
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map
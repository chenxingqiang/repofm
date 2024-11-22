import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';
import pc from 'picocolors';
class Spinner {
    constructor(message) {
        this.spinner = cliSpinners.dots;
        this.currentFrame = 0;
        this.interval = null;
        this.message = message;
    }
    start() {
        const frames = this.spinner.frames;
        const framesLength = frames.length;
        this.interval = setInterval(() => {
            this.currentFrame++;
            const frame = frames[this.currentFrame % framesLength];
            logUpdate(`${pc.cyan(frame)} ${this.message}`);
        }, this.spinner.interval);
    }
    update(message) {
        this.message = message;
    }
    stop(finalMessage) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        logUpdate(finalMessage);
        logUpdate.done();
    }
    succeed(message) {
        this.stop(`${pc.green('✔')} ${message}`);
    }
    fail(message) {
        this.stop(`${pc.red('✖')} ${message}`);
    }
}
export default Spinner;
//# sourceMappingURL=cliSpinner.js.map
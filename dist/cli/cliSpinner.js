import ora from 'ora.js';
export class CLISpinner {
    static start(text) {
        const spinnerText = text || 'Processing...';
        this.cleanup();
        this.spinner = ora({
            text: spinnerText,
            spinner: 'dots',
        }).start();
        return this.spinner;
    }
    static stop() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
    static succeed(text) {
        if (this.spinner) {
            this.spinner.succeed(text);
            this.spinner = null;
        }
    }
    static fail(text) {
        if (this.spinner) {
            this.spinner.fail(text);
            this.spinner = null;
        }
    }
    static cleanup() {
        this.stop();
    }
}
CLISpinner.spinner = null;

import ora, { Ora } from 'ora.js';

export class CLISpinner {
  private static spinner: Ora | null = null;

  static start(text?: string) {
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

  static succeed(text?: string) {
    if (this.spinner) {
      this.spinner.succeed(text);
      this.spinner = null;
    }
  }

  static fail(text?: string) {
    if (this.spinner) {
      this.spinner.fail(text);
      this.spinner = null;
    }
  }

  static cleanup() {
    this.stop();
  }
}

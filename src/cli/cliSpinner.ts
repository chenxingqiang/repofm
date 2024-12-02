import ora, { type Ora } from 'ora';

export class CLISpinner {
  private spinner: Ora;
  private static instance: Ora;

  constructor() {
    if (!CLISpinner.instance) {
      CLISpinner.instance = ora({
        spinner: 'dots',
        isEnabled: !process.env.CI && !process.env.NODE_ENV?.includes('test')
      });
    }
    this.spinner = CLISpinner.instance;
  }

  start(text: string = ''): void {
    this.spinner.start(text);
  }

  stop(): void {
    this.spinner.stop();
  }

  update(text: string): void {
    this.spinner.text = text;
  }

  succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  fail(text?: string): void {
    this.spinner.fail(text);
  }

  static cleanup(): void {
    if (CLISpinner.instance) {
      CLISpinner.instance.stop();
      CLISpinner.instance = null as unknown as Ora;
    }
  }
}

import { Spinner } from './types/spinner.js';

export class FallbackSpinner implements Spinner {
  private text: string | undefined;

  constructor(text?: string) {
    this.text = text;
  }

  start(text?: string): void {
    if (text) this.text = text;
    console.log(`⏳ ${this.text || 'Processing...'}`);
  }

  stop(): void {
    // No-op for fallback spinner
  }

  succeed(text?: string): void {
    console.log(`✅ ${text || this.text || 'Completed'}`);
  }

  fail(text?: string): void {
    console.error(`❌ ${text || this.text || 'Failed'}`);
  }

  warn(text?: string): void {
    console.warn(`⚠️ ${text || this.text || 'Warning'}`);
  }

  info(text?: string): void {
    console.info(`ℹ️ ${text || this.text || 'Information'}`);
  }
}
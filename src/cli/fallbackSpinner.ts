export class FallbackSpinner {
  private text: string = '';

  start(text: string = ''): void {
    this.text = text;
    console.log(`⠋ ${text}`);
  }

  stop(): void {
    // No-op in fallback
  }

  update(text: string): void {
    this.text = text;
    console.log(`⠋ ${text}`);
  }

  succeed(text?: string): void {
    console.log(`✔ ${text || this.text}`);
  }

  fail(text?: string): void {
    console.log(`✖ ${text || this.text}`);
  }
} 
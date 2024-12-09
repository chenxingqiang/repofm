export class FallbackSpinner {
    constructor(text) {
        this.text = text;
    }
    start(text) {
        if (text)
            this.text = text;
        console.log(`⏳ ${this.text || 'Processing...'}`);
    }
    stop() {
        // No-op for fallback spinner
    }
    succeed(text) {
        console.log(`✅ ${text || this.text || 'Completed'}`);
    }
    fail(text) {
        console.error(`❌ ${text || this.text || 'Failed'}`);
    }
    warn(text) {
        console.warn(`⚠️ ${text || this.text || 'Warning'}`);
    }
    info(text) {
        console.info(`ℹ️ ${text || this.text || 'Information'}`);
    }
}

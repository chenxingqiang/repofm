import { EventEmitter } from 'events';
import { webcrypto } from 'node:crypto';
export class EncryptionManager {
    constructor() {
        this.key = null;
        this.initKey();
    }
    async initKey() {
        this.key = await webcrypto.subtle.generateKey({
            name: 'AES-GCM',
            length: 256
        }, true, ['encrypt', 'decrypt']);
    }
    async encrypt(data) {
        if (!this.key) {
            await this.initKey();
        }
        const iv = webcrypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, encoded);
        return { encrypted, iv };
    }
    async decrypt(encrypted, iv) {
        if (!this.key) {
            await this.initKey();
        }
        const decrypted = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv }, this.key, encrypted);
        const decoded = new TextDecoder().decode(decrypted);
        return JSON.parse(decoded);
    }
}
export class ZeroTrustManager extends EventEmitter {
    async verifyAccess(userId, resourceId, action, context) {
        // Emit verification event for high-risk actions
        if (action === 'delete' || context?.deviceId === 'unknown') {
            this.emit('verification-required', { userId });
        }
        return true;
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
export class IntrusionDetectionSystem {
    async analyzeRequest(request) {
        const suspiciousPatterns = [
            'sql injection',
            'xss',
            'command injection'
        ];
        const requestStr = JSON.stringify(request).toLowerCase();
        return suspiciousPatterns.some(pattern => requestStr.includes(pattern));
    }
}
//# sourceMappingURL=types.js.map
import { EventEmitter } from 'events.js';
import { webcrypto } from 'node:crypto';

export class EncryptionManager {
  private key: CryptoKey | null = null;

  constructor() {
    this.initKey();
  }

  private async initKey(): Promise<void> {
    this.key = await webcrypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: any): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    if (!this.key) {
      await this.initKey();
    }
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const encrypted = await webcrypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key!,
      encoded
    );
    return { encrypted, iv };
  }

  async decrypt(encrypted: ArrayBuffer, iv: Uint8Array): Promise<any> {
    if (!this.key) {
      await this.initKey();
    }
    const decrypted = await webcrypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key!,
      encrypted
    );
    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  }
}

export class ZeroTrustManager extends EventEmitter {
  async verifyAccess(
    userId: string,
    resourceId: string,
    action: string,
    context?: { deviceId?: string; location?: string }
  ): Promise<boolean> {
    // Emit verification event for high-risk actions
    if (action === 'delete' || context?.deviceId === 'unknown') {
      this.emit('verification-required', { userId });
    }
    return true;
  }

  once(event: 'verification-required', listener: (data: { userId: string }) => void): this {
    return super.once(event, listener);
  }
}

export class IntrusionDetectionSystem {
  async analyzeRequest(request: any): Promise<boolean> {
    const suspiciousPatterns = [
      'sql injection',
      'xss',
      'command injection'
    ];
    const requestStr = JSON.stringify(request).toLowerCase();
    return suspiciousPatterns.some(pattern => requestStr.includes(pattern));
  }
} 
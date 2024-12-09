import { EventEmitter } from 'events.js';
export declare class EncryptionManager {
    private key;
    constructor();
    private initKey;
    encrypt(data: any): Promise<{
        encrypted: ArrayBuffer;
        iv: Uint8Array;
    }>;
    decrypt(encrypted: ArrayBuffer, iv: Uint8Array): Promise<any>;
}
export declare class ZeroTrustManager extends EventEmitter {
    verifyAccess(userId: string, resourceId: string, action: string, context?: {
        deviceId?: string;
        location?: string;
    }): Promise<boolean>;
    once(event: 'verification-required', listener: (data: {
        userId: string;
    }) => void): this;
}
export declare class IntrusionDetectionSystem {
    analyzeRequest(request: any): Promise<boolean>;
}

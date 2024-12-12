import { EventEmitter } from 'events';
export declare class EncryptionManager extends EventEmitter {
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
    deviceId?: string;
    location?: string;
    userId: string;
    constructor(userId: string);
    verifyAccess(resourceId: string, action: string, context?: {
        deviceId?: string;
        location?: string;
    }): Promise<boolean>;
}
export declare class IntrusionDetectionSystem extends EventEmitter {
    constructor();
    analyzeRequest(request: any): Promise<boolean>;
}

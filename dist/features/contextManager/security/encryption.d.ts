export declare class EncryptionManager {
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    private encryptionKey;
    constructor(key?: string);
    private deriveKey;
    encrypt(data: any): Promise<{
        encrypted: Buffer;
        iv: Buffer;
        tag: Buffer;
    }>;
    decrypt(encrypted: Buffer, iv: Buffer, tag: Buffer): Promise<any>;
    clearKey(): void;
    static generateSecureRandomKey(length?: number): string;
}
export declare class SecurityManager {
    private readonly algorithm;
    private readonly KEY_LENGTH;
    private readonly IV_LENGTH;
    private encryptionKey;
    constructor(key?: string);
    private deriveKey;
    private getKey;
    encrypt(data: string): Promise<{
        encrypted: string;
        iv: string;
    }>;
    decrypt(encrypted: string, ivHex: string): Promise<string>;
    rotateKey(newKey?: string): void;
    clearKey(): void;
    static generateSecureRandomKey(length?: number): string;
}

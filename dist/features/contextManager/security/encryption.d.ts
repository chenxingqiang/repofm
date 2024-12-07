export declare class EncryptionManager {
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    private encryptionKey;
    constructor(key?: string);
    encrypt(data: any): Promise<{
        encrypted: Buffer;
        iv: Buffer;
        tag: Buffer;
    }>;
    decrypt(encrypted: Buffer, iv: Buffer, tag: Buffer): Promise<any>;
}

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
export class EncryptionManager {
    constructor(key) {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.encryptionKey = key ?
            Buffer.from(key, 'hex') :
            randomBytes(this.keyLength);
    }
    async encrypt(data) {
        const iv = randomBytes(this.ivLength);
        const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);
        const jsonData = JSON.stringify(data);
        const encrypted = Buffer.concat([
            cipher.update(jsonData, 'utf8'),
            cipher.final()
        ]);
        return {
            encrypted,
            iv,
            tag: cipher.getAuthTag()
        };
    }
    async decrypt(encrypted, iv, tag) {
        const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        return JSON.parse(decrypted.toString('utf8'));
    }
}
//# sourceMappingURL=encryption.js.map
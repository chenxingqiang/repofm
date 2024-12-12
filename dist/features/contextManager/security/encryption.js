import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
export class EncryptionManager {
    constructor(key) {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.encryptionKey = key ?
            this.deriveKey(key) :
            randomBytes(this.keyLength);
    }
    // Derive a consistent key from a string input
    deriveKey(input) {
        return createHash('sha256')
            .update(input)
            .digest();
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
    // Securely clear the key from memory
    clearKey() {
        if (this.encryptionKey) {
            this.encryptionKey.fill(0);
        }
    }
    // Additional security methods
    static generateSecureRandomKey(length = 32) {
        return randomBytes(length).toString('hex');
    }
}
export class SecurityManager {
    constructor(key) {
        this.algorithm = 'aes-256-cbc';
        this.KEY_LENGTH = 32;
        this.IV_LENGTH = 16;
        // Store the encryption key securely
        this.encryptionKey = null;
        // Initialize key from provided string or generate a new one
        this.encryptionKey = key
            ? this.deriveKey(key)
            : randomBytes(this.KEY_LENGTH);
    }
    // Derive a consistent key from a string input
    deriveKey(input) {
        return createHash('sha256')
            .update(input)
            .digest();
    }
    // Ensure we have a valid key before encryption/decryption
    getKey() {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }
        return this.encryptionKey;
    }
    async encrypt(data) {
        // Generate a secure IV
        const iv = randomBytes(this.IV_LENGTH);
        // Use the stored or derived key
        const key = this.getKey();
        try {
            const cipher = createCipheriv(this.algorithm, key, iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return {
                encrypted,
                iv: iv.toString('hex') // Convert IV to hex for easier storage/transmission
            };
        }
        catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Encryption process failed');
        }
    }
    async decrypt(encrypted, ivHex) {
        // Convert hex IV back to buffer
        const iv = Buffer.from(ivHex, 'hex');
        // Use the stored or derived key
        const key = this.getKey();
        try {
            const decipher = createDecipheriv(this.algorithm, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Decryption process failed');
        }
    }
    // Method to rotate the encryption key
    rotateKey(newKey) {
        this.encryptionKey = newKey
            ? this.deriveKey(newKey)
            : randomBytes(this.KEY_LENGTH);
    }
    // Securely clear the key from memory
    clearKey() {
        if (this.encryptionKey) {
            this.encryptionKey.fill(0);
            this.encryptionKey = null;
        }
    }
    // Additional security methods
    static generateSecureRandomKey(length = 32) {
        return randomBytes(length).toString('hex');
    }
}
//# sourceMappingURL=encryption.js.map
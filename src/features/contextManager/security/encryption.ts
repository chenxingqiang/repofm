import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

export class EncryptionManager {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  private encryptionKey: Buffer;

  constructor(key?: string) {
    this.encryptionKey = key ? 
      this.deriveKey(key) : 
      randomBytes(this.keyLength);
  }

  // Derive a consistent key from a string input
  private deriveKey(input: string): Buffer {
    return createHash('sha256')
      .update(input)
      .digest();
  }

  async encrypt(data: any): Promise<{
    encrypted: Buffer;
    iv: Buffer;
    tag: Buffer;
  }> {
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

  async decrypt(encrypted: Buffer, iv: Buffer, tag: Buffer): Promise<any> {
    const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  // Securely clear the key from memory
  clearKey(): void {
    if (this.encryptionKey) {
      this.encryptionKey.fill(0);
    }
  }

  // Additional security methods
  static generateSecureRandomKey(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}

export class SecurityManager {
  private readonly algorithm = 'aes-256-cbc';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;

  // Store the encryption key securely
  private encryptionKey: Buffer | null = null;

  constructor(key?: string) {
    // Initialize key from provided string or generate a new one
    this.encryptionKey = key 
      ? this.deriveKey(key) 
      : randomBytes(this.KEY_LENGTH);
  }

  // Derive a consistent key from a string input
  private deriveKey(input: string): Buffer {
    return createHash('sha256')
      .update(input)
      .digest();
  }

  // Ensure we have a valid key before encryption/decryption
  private getKey(): Buffer {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    return this.encryptionKey;
  }

  async encrypt(data: string): Promise<{ encrypted: string, iv: string }> {
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
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption process failed');
    }
  }

  async decrypt(encrypted: string, ivHex: string): Promise<string> {
    // Convert hex IV back to buffer
    const iv = Buffer.from(ivHex, 'hex');
    
    // Use the stored or derived key
    const key = this.getKey();
    
    try {
      const decipher = createDecipheriv(this.algorithm, key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption process failed');
    }
  }

  // Method to rotate the encryption key
  rotateKey(newKey?: string): void {
    this.encryptionKey = newKey 
      ? this.deriveKey(newKey)
      : randomBytes(this.KEY_LENGTH);
  }

  // Securely clear the key from memory
  clearKey(): void {
    if (this.encryptionKey) {
      this.encryptionKey.fill(0);
      this.encryptionKey = null;
    }
  }

  // Additional security methods
  static generateSecureRandomKey(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}
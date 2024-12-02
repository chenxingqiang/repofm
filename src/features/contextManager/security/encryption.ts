import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionManager {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  private encryptionKey: Buffer;

  constructor(key?: string) {
    this.encryptionKey = key ? 
      Buffer.from(key, 'hex') : 
      randomBytes(this.keyLength);
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
} 
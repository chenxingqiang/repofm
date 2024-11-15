import type { SecretLintCoreConfig } from '@secretlint/types';
import { describe, expect, test } from 'vitest';
import { createSecretLintConfig, runSecretLint } from '../../../src/core/security/securityCheck.js';
// tests/core/security/securityCheck.test.ts

import { beforeEach, it, vi } from 'vitest';
import { runSecurityCheck } from '../../../src/core/security/securityCheck.js';
import { logger } from '../../../src/shared/logger.js';

describe('securityCheck', () => {
  const config: SecretLintCoreConfig = createSecretLintConfig();

  test('should detect sensitive information', async () => {
    // Sensitive content with secrets from https://secretlint.github.io/
    // secretlint-disable
    const sensitiveContent = `
# Secretlint Demo

URL: https://user:pass@example.com

GitHub Token: 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

SendGrid: "SG.APhb3zgjtx3hajdas1TjBB.H7Sgbba3afgKSDyB442aDK0kpGO3SD332313-L5528Kewhere"

AWS_SECRET_ACCESS_KEY = wJalrXUtnFEMI/K7MDENG/bPxRfiCYSECRETSKEY

Slack:
xoxa-23984754863-2348975623103
xoxb-23984754863-2348975623103
xoxo-23984754863-2348975623103

Private Key:

-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCYdGaf5uYMsilGHfnx/zxXtihdGFr3hCWwebHGhgEAVn0xlsTd
1QwoKi+rpI1O6hzyVOuoQtboODsONGRlHbNl6yJ936Yhmr8PiNwpA5qIxZAdmFv2
tqEllWr0dGPPm3B/2NbjuMpSiJNAcBQa46X++doG5yNMY8NCgTsjBZIBKwIDAQAB
AoGAN+Pkg5aIm/rsurHeoeMqYhV7srVtE/S0RIA4tkkGMPOELhvRzGmAbXEZzNkk
nNujBQww4JywYK3MqKZ4b8F1tMG3infs1w8V7INAYY/c8HzfrT3f+MVxijoKV2Fl
JlUXCclztoZhxAxhCR+WC1Upe1wIrWNwad+JA0Vws/mwrEECQQDxiT/Q0lK+gYaa
+riFeZmOaqwhlFlYNSK2hCnLz0vbnvnZE5ITQoV+yiy2+BhpMktNFsYNCfb0pdKN
D87x+jr7AkEAoZWITvqErh1RbMCXd26QXZEfZyrvVZMpYf8BmWFaBXIbrVGme0/Q
d7amI6B8Vrowyt+qgcUk7rYYaA39jYB7kQJAdaX2sY5gw25v1Dlfe5Q5WYdYBJsv
0alAGUrS2PVF69nJtRS1SDBUuedcVFsP+N2IlCoNmfhKk+vZXOBgWrkZ1QJAGJlE
FAntUvhhofW72VG6ppPmPPV7VALARQvmOWxpoPSbJAqPFqyy5tamejv/UdCshuX/
9huGINUV6BlhJT6PEQJAF/aqQTwZqJdwwJqYEQArSmyOW7UDAlQMmKMofjBbeBvd
H4PSJT5bvaEhxRj7QCwonoX4ZpV0beTnzloS55Z65g==
-----END RSA PRIVATE KEY-----
    `;
    // secretlint-enable

    const secretLintResult = await runSecretLint('test.md', sensitiveContent, config);
    const isSuspicious = secretLintResult.messages.length > 0;
    expect(isSuspicious).toBe(true);
  });

  test('should not detect sensitive information in normal content', async () => {
    const normalContent = `
# Normal Content

This is a regular markdown file with no sensitive information.

Here's some code:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

And here's a list:

1. Item 1
2. Item 2
3. Item 3

That's all!
    `;

    const secretLintResult = await runSecretLint('normal.md', normalContent, config);
    const isSuspicious = secretLintResult.messages.length > 0;
    expect(isSuspicious).toBe(false);
  });
});




vi.mock('../../../src/shared/logger');
describe('securityCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createSecretLintConfig', () => {
    it('should create valid SecretLint config', () => {
      const config = createSecretLintConfig();

      expect(config.rules).toBeDefined();
      expect(config.rules[0].id).toBe('@secretlint/secretlint-rule-preset-recommend');
      expect(config.rules[0].rule).toBeDefined();
    });
  });

  describe('runSecurityCheck', () => {
    it('should detect API keys and tokens', async () => {
      const mockFiles = [
        {
          path: 'config.js',
          content: 'const apiKey = "sk_test_12345678901234567890";'
        },
        {
          path: 'auth.js',
          content: 'const token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";'
        }
      ];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toHaveLength(2);
      expect(results[0].filePath).toBe('config.js');
      expect(results[1].filePath).toBe('auth.js');
      expect(results[0].messages).toContain(expect.stringContaining('API'));
      expect(results[1].messages).toContain(expect.stringContaining('token'));
    });

    it('should detect AWS credentials', async () => {
      const mockFiles = [{
        path: 'aws-config.js',
        content: `
          AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
          AWS_SECRET_ACCESS_KEY=abcdef1234567890ghijklmnopqrstuvwxyz1234
        `
      }];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toHaveLength(1);
      expect(results[0].filePath).toBe('aws-config.js');
      expect(results[0].messages).toContain(expect.stringContaining('AWS'));
    });

    it('should detect private keys', async () => {
      const mockFiles = [{
        path: 'private-key.pem',
        content: `
          -----BEGIN RSA PRIVATE KEY-----
          MIICXAIBAAKBgQC8kGa1pSjbSYZVebtTRBLxBz5H4i2p/llLCrEeQhta5kaQu/Rn
          vuER4W8oDH3+3iuIYW4VQAzyqFpwuzjkDI+17t5t0tyazyZ8JXw+KgXTxldMPEL9
          5+qVhgXvwtihXC1c5oGbRlEDvDF6Sa53rcFVsYJ4ehde/zUxo6UvS7UrBQIDAQAB
          AoGAb/MXV46XxCFRxNuB8LyAtmLDgi/xRnTAlMHjSACddwkyKem8//8eZtw9fzxz
          bWZ/1/doQOuHBGYZU8aDzzj59FZ78dyzNFoF91hbvZKkg+6wGyd/LrGVEB+Xre0J
          Nil0GReM2AHDNZUYRv+HYJPIOrB0CRczLQsgFJ8K6aAD6F0CQQDzbpjYdx10qgK1
          cP59UHiHjPZYC0loEsk7s+hUmT3QHerAQJMZWC11Qrn2N+ybwwNblDKv+s5qgMQ5
          5tNoQ9IfAkEAxkyffU6ythpg/H0Ixe1I2rd0GbF05biIzO/i77Det3n4YsJVlDck
          ZkcvY3SK2iRIL4c9yY6hlIhs+K9wXTtGWwJBAO9Dskl48mO7woPR9uD22jDpNSwe
          k90OMepTjzSvlhjbfuPN1IdhqvSJTDychRwn1kIJ89m7yxkstcCndcfoqWUCQGOb
          qaGwHmUK6xzpUbbacnYrIM6nLSkXgOAwv7XXCojvY614ILTK3iXiLBOxPu5Eu13k
          eUz9sHyD6vkgZzjtxXECQAkp4Xerf5TGfQXGXhxIX52yH+N2LtujCdkQZjXAsGdm
          B2zNzvrlgRmgBrklMTrMYgm1NPcW+bRLGcwgW2PTvNM=
          -----END RSA PRIVATE KEY-----
        `
      }];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toHaveLength(1);
      expect(results[0].filePath).toBe('private-key.pem');
      expect(results[0].messages).toContain(expect.stringContaining('private key'));
    });

    it('should detect database passwords', async () => {
      const mockFiles = [{
        path: 'database.config',
        content: `
          DB_HOST=localhost
          DB_USER=admin
          DB_PASSWORD=super_secret_password123
          POSTGRES_PASSWORD=postgres_password_456
        `
      }];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toHaveLength(1);
      expect(results[0].filePath).toBe('database.config');
      expect(results[0].messages.some(m => m.includes('password'))).toBe(true);
    });

    it('should not flag non-sensitive information', async () => {
      const mockFiles = [{
        path: 'safe-file.js',
        content: `
          const config = {
            timeout: 3000,
            retries: 3,
            endpoint: 'https://api.example.com'
          };
        `
      }];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toHaveLength(0);
    });

    it('should handle empty files', async () => {
      const mockFiles = [{
        path: 'empty.js',
        content: ''
      }];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toHaveLength(0);
    });

    it('should check file extensions appropriately', async () => {
      const mockFiles = [
        {
          path: 'config.js',
          content: 'const password = "secret123";'
        },
        {
          path: 'data.txt',
          content: 'const password = "secret123";'
        }
      ];

      const results = await runSecurityCheck(mockFiles);

      // Both files should be checked regardless of extension
      expect(results).toHaveLength(2);
    });
  });

  describe('runSecretLint', () => {
    it('should log issues found in files', async () => {
      const config: SecretLintCoreConfig = createSecretLintConfig();
      const result = await runSecretLint(
        'test.js',
        'GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz',
        config
      );

      expect(result.messages.length).toBeGreaterThan(0);
      expect(logger.trace).toHaveBeenCalled();
    });

    it('should handle files with multiple issues', async () => {
      const config: SecretLintCoreConfig = createSecretLintConfig();
      const content = `
        GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz
        AWS_SECRET_KEY=abcdef1234567890ghijklmnopqrstuvwxyz1234
        DB_PASSWORD=super_secret_password
      `;

      const result = await runSecretLint('test.js', content, config);

      expect(result.messages.length).toBeGreaterThan(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed files gracefully', async () => {
      const mockFiles = [{
        path: 'malformed.js',
        content: Buffer.from([0xFF, 0xFE, 0x00]).toString() // Invalid UTF-8
      }];

      const results = await runSecurityCheck(mockFiles);

      // Should not throw error but log warning
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle exceptionally large files', async () => {
      const mockFiles = [{
        path: 'large.js',
        content: 'a'.repeat(10 * 1024 * 1024) // 10MB file
      }];

      const results = await runSecurityCheck(mockFiles);

      expect(results).toBeDefined();
    });
  });

  describe('Progress Callback', () => {
    it('should call progress callback for each file', async () => {
      const mockCallback = vi.fn();
      const mockFiles = [
        { path: 'file1.js', content: 'const x = 1;' },
        { path: 'file2.js', content: 'const y = 2;' }
      ];

      await runSecurityCheck(mockFiles, mockCallback);

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.stringContaining('Running security check')
      );
    });
  });

  describe('Common Security Issues', () => {
    it('should detect common sensitive patterns', async () => {
      const sensitivePatterns = [
        { type: 'OAuth Token', content: 'oauth_token=1234567890abcdef' },
        { type: 'JWT', content: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0' },
        { type: 'SSH Key', content: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC' },
        { type: 'API Key', content: 'api_key=1234567890abcdef' },
        { type: 'Access Token', content: 'access_token=1234567890abcdef' },
        { type: 'Client Secret', content: 'client_secret=1234567890abcdef' }
      ];

      for (const pattern of sensitivePatterns) {
        const mockFiles = [{
          path: `${pattern.type.toLowerCase()}.js`,
          content: pattern.content
        }];

        const results = await runSecurityCheck(mockFiles);
        expect(results).toHaveLength(1);
        expect(results[0].messages.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance', () => {
    it('should process files in reasonable time', async () => {
      const mockFiles = Array.from({ length: 100 }, (_, i) => ({
        path: `file${i}.js`,
        content: 'const x = 1;'
      }));

      const startTime = Date.now();
      await runSecurityCheck(mockFiles);
      const endTime = Date.now();

      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});

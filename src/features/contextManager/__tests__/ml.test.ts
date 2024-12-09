import { MLPredictor } from '../ml/types.js';
import { ClusterManager } from '../cluster.js';
import { EncryptionManager } from '../security.js';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

describe('ML Features', () => {
  let predictor: MLPredictor;
  let cluster: ClusterManager;
  let encryption: EncryptionManager;

  beforeEach(() => {
    predictor = new MLPredictor();
    cluster = new ClusterManager();
    encryption = new EncryptionManager();
  });

  describe('Access Prediction', () => {
    it('should predict next access based on patterns', async () => {
      for (let i = 0; i < 10; i++) {
        predictor.recordAccess('test-context');
      }

      const prediction = await predictor.predictNextAccess('test-context');
      expect(typeof prediction).toBe('boolean');
    });

    it('should identify related contexts', async () => {
      predictor.recordAccess('context-1', 'context-2');
      predictor.recordAccess('context-2', 'context-1');

      const related = predictor.predictRelatedContexts('context-1');
      expect(related).toContain('context-2');
    });
  });
});

describe('Distributed Features', () => {
  let cluster: ClusterManager;

  beforeEach(() => {
    cluster = new ClusterManager();
  });

  it('should broadcast updates to cluster', async () => {
    const updatePromise = new Promise(resolve => {
      cluster.once('context-update', (contextId: any, changes: any) => {
        expect(contextId).toBe('test-context');
        resolve(undefined);
      });
    });

    cluster.broadcastUpdate('test-context', { data: 'test' });
    await updatePromise;
  });
});

describe('Security Features', () => {
  let encryption: EncryptionManager;

  beforeEach(() => {
    encryption = new EncryptionManager();
  });

  it('should encrypt and decrypt data', async () => {
    const data = { test: 'secret' };
    await new Promise(resolve => setTimeout(resolve, 100));
    const { encrypted, iv } = await encryption.encrypt(data);
    const decrypted = await encryption.decrypt(encrypted, iv);
    expect(decrypted).toEqual(data);
  });
}); 
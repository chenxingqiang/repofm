import { beforeEach, describe, expect } from '@jest/globals';
import { MLPredictor } from '../ml/types.js';
import { ClusterManager } from '../cluster/clusterManager.js';
import { SecurityManager } from '../security/securityManager.js';
import { it } from 'vitest';
describe('ML Features', () => {
    let predictor;
    let cluster;
    let encryption;
    beforeEach(() => {
        predictor = new MLPredictor();
        cluster = new ClusterManager();
        encryption = new SecurityManager();
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
    let cluster;
    beforeEach(() => {
        cluster = new ClusterManager();
    });
    it('should broadcast updates to cluster', async () => {
        const updatePromise = new Promise(resolve => {
            cluster.once('context-update', (contextId, changes) => {
                expect(contextId).toBe('test-context');
                resolve(undefined);
            });
        });
        cluster.broadcastUpdate('test-context', { data: 'test' });
        await updatePromise;
    });
});
describe('Security Features', () => {
    let encryption;
    beforeEach(() => {
        encryption = new SecurityManager();
    });
    it('should encrypt and decrypt data', async () => {
        const data = { test: 'secret' };
        await new Promise(resolve => setTimeout(resolve, 100));
        const { encrypted, iv } = await encryption.encrypt(data);
        const decrypted = await encryption.decrypt(encrypted, iv);
        expect(decrypted).toEqual(data);
    });
});
//# sourceMappingURL=ml.test.js.map
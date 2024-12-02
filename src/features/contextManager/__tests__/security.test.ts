import { DeepAnalytics } from "../analytics/deepAnalytics";
import { RiskAnalyzer } from "../analytics/riskAnalysis";
import { IntrusionDetectionSystem, ZeroTrustManager } from "../security/types";

describe('Advanced Security Features', () => {
  let zeroTrust: ZeroTrustManager;
  let ids: IntrusionDetectionSystem;

  beforeEach(() => {
    zeroTrust = new ZeroTrustManager();
    ids = new IntrusionDetectionSystem();
  });

  describe('Zero Trust Security', () => {
    it('should verify access based on context', async () => {
      const access = await zeroTrust.verifyAccess(
        'user1',
        'resource1',
        'read',
        {
          deviceId: 'device1',
          location: 'office'
        }
      );
      
      expect(typeof access).toBe('boolean');
    });

    it('should detect high-risk activities', async () => {
      const verificationPromise = new Promise(resolve => {
        zeroTrust.once('verification-required', (data) => {
          expect(data.userId).toBe('user1');
          resolve(undefined);
        });
      });

      await zeroTrust.verifyAccess('user1', 'resource1', 'delete', {
        deviceId: 'unknown',
        location: 'unknown'
      });

      await verificationPromise;
    });
  });

  describe('Intrusion Detection', () => {
    it('should detect suspicious patterns', async () => {
      const suspicious = await ids.analyzeRequest({
        query: "'; DROP TABLE users; --"
      });
      
      expect(suspicious).toBe(true);
    });
  });
});

describe('Advanced Analytics', () => {
  let deepAnalytics: DeepAnalytics;
  let riskAnalyzer: RiskAnalyzer;

  beforeEach(() => {
    deepAnalytics = new DeepAnalytics();
    riskAnalyzer = new RiskAnalyzer();
  });

  it('should predict future behavior', async () => {
    const data = Array(24).fill(0).map(() => 
      Array(10).fill(0).map(() => Math.random())
    );
    await deepAnalytics.trainModel(data);
    const prediction = await deepAnalytics.predictFutureBehavior(data);
    
    expect(prediction.length).toBeGreaterThan(0);
  });

  it('should analyze risk factors', async () => {
    const analysis = await riskAnalyzer.analyzeRisk({
      userId: 'user1',
      action: 'delete',
      resource: 'sensitive-data'
    });

    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(1);
    expect(Array.isArray(analysis.factors)).toBe(true);
    expect(Array.isArray(analysis.recommendations)).toBe(true);
  });

  it('should analyze behavior patterns', async () => {
    const data = [[1, 2, 3], [4, 5, 6]];
    await deepAnalytics.trainModel(data);
    const prediction = await deepAnalytics.predictFutureBehavior(data);
    expect(prediction).toBeDefined();
  });
}); 
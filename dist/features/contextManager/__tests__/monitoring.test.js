import { describe, beforeEach, it, expect } from "vitest";
import { MonitoringSystem } from "../monitoring";
describe('Monitoring System', () => {
    let monitoring;
    beforeEach(() => {
        monitoring = new MonitoringSystem();
    });
    describe('Performance Monitoring', () => {
        it('should track operation latency', () => {
            monitoring.recordMetric('operationLatency', 500);
            const metrics = monitoring.getMetrics();
            expect(metrics.operationLatency).toBe(500);
        });
        it('should emit alert on high latency', async () => {
            monitoring.once('alert', async (alert) => {
                expect(alert.type).toBe('latency');
            });
            monitoring.recordMetric('operationLatency', 2000);
        });
    });
    describe('Health Checks', () => {
        it('should perform periodic health checks', async () => {
            await new Promise(resolve => setTimeout(resolve, 1100));
            const health = monitoring.getHealthStatus();
            expect(health.lastCheck).toBeGreaterThan(0);
        });
        it('should detect unhealthy services', async () => {
            monitoring.once('health_issue', status => {
                expect(status.isHealthy).toBe(false);
                expect(status.issues).toHaveLength(1);
            });
            // Simulate service failure
            monitoring['healthStatus'].services.database = false;
            await monitoring['performHealthCheck']();
        });
    });
});

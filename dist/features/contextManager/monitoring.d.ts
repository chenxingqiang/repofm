import { EventEmitter } from 'events.js';
export interface PerformanceMetrics {
    operationLatency: number;
    cacheHitRate: number;
    syncLatency: number;
    compressionRatio: number;
    errorRate: number;
    activeConnections: number;
}
export interface HealthStatus {
    isHealthy: boolean;
    lastCheck: number;
    issues: string[];
    services: {
        database: boolean;
        cache: boolean;
        sync: boolean;
    };
}
export declare class MonitoringSystem extends EventEmitter {
    private metrics;
    private healthStatus;
    private thresholds;
    private services;
    constructor();
    recordMetric(name: keyof PerformanceMetrics, value: number): void;
    private checkThresholds;
    private startHealthCheck;
    private performHealthCheck;
    checkDatabaseHealth(): Promise<boolean>;
    checkCacheHealth(): Promise<boolean>;
    checkSyncHealth(): Promise<boolean>;
    getMetrics(): PerformanceMetrics;
    getHealthStatus(): HealthStatus;
    setServiceHealth(service: string, isHealthy: boolean): void;
}

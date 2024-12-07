import { EventEmitter } from 'events';
export class IntrusionDetectionSystem extends EventEmitter {
    constructor() {
        super();
        this.patterns = new Map();
        this.suspiciousActivities = [];
        this.maxLogSize = 1000;
        this.initializePatterns();
    }
    initializePatterns() {
        this.patterns.set('sql-injection', /('|"|;|--|\/\*|\*\/|=|%|@@|char|union|select|delete|drop|update|insert)/i);
        this.patterns.set('xss', /<script|javascript:|onerror=|onload=|eval\(|setTimeout\(|setInterval\(/i);
        this.patterns.set('path-traversal', /\.\.\/|\.\.\\|~\/|~\\|\.\.%2f|\.\.%5c/i);
    }
    async analyzeRequest(request) {
        const suspicious = await this.detectThreats(request);
        if (suspicious) {
            await this.logSuspiciousActivity(request);
            return true;
        }
        return false;
    }
    async detectThreats(request) {
        const payload = JSON.stringify(request);
        for (const [type, pattern] of this.patterns) {
            if (pattern.test(payload)) {
                this.emit('threat-detected', {
                    type,
                    payload,
                    timestamp: Date.now()
                });
                return true;
            }
        }
        return false;
    }
    async logSuspiciousActivity(activity) {
        this.suspiciousActivities.push({
            ...activity,
            timestamp: Date.now()
        });
        if (this.suspiciousActivities.length > this.maxLogSize) {
            await this.archiveSuspiciousActivities();
        }
    }
    async archiveSuspiciousActivities() {
        const activitiesToArchive = this.suspiciousActivities.slice(0, -this.maxLogSize);
        this.suspiciousActivities = this.suspiciousActivities.slice(-this.maxLogSize);
    }
}
//# sourceMappingURL=ids.js.map
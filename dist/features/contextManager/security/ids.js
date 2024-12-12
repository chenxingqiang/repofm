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
        // Add common security patterns
        this.patterns.set('sql_injection', /(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b).*(\bFROM\b|\bWHERE\b)/i);
        this.patterns.set('xss', /(<script>|javascript:|onerror=)/i);
        this.patterns.set('path_traversal', /(\.\.|%2e%2e)/i);
    }
    async analyzeRequest(request) {
        if (!request)
            return false;
        const payload = JSON.stringify(request);
        for (const [type, pattern] of this.patterns) {
            if (pattern.test(payload)) {
                this.emit('intrusion-detected', {
                    type,
                    payload,
                    timestamp: Date.now()
                });
                this.logSuspiciousActivity({ type, payload });
                return false;
            }
        }
        return true;
    }
    logSuspiciousActivity(activity) {
        this.suspiciousActivities.push({
            ...activity,
            timestamp: Date.now()
        });
        if (this.suspiciousActivities.length > this.maxLogSize) {
            const activitiesToArchive = this.suspiciousActivities.slice(0, -this.maxLogSize);
            this.suspiciousActivities = this.suspiciousActivities.slice(-this.maxLogSize);
            // Optional: implement archiving logic
        }
    }
}
export class IDSService extends EventEmitter {
    constructor() {
        super();
        this.ids = new IntrusionDetectionSystem();
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.ids.on('intrusion-detected', (data) => {
            this.emit('alert', {
                type: 'intrusion',
                severity: 'high',
                ...data
            });
        });
    }
    async analyzeRequest(request) {
        return this.ids.analyzeRequest(request);
    }
}
//# sourceMappingURL=ids.js.map
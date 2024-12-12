import { EventEmitter } from 'events';
import { IntrusionDetectionSystem as IIDSBase } from './types';

export class IntrusionDetectionSystem extends EventEmitter implements IIDSBase {
  private readonly patterns: Map<string, RegExp> = new Map();
  private suspiciousActivities: any[] = [];
  private readonly maxLogSize = 1000;

  constructor() {
    super();
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Add common security patterns
    this.patterns.set('sql_injection', /(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b).*(\bFROM\b|\bWHERE\b)/i);
    this.patterns.set('xss', /(<script>|javascript:|onerror=)/i);
    this.patterns.set('path_traversal', /(\.\.|%2e%2e)/i);
  }

  async analyzeRequest(request: any): Promise<boolean> {
    if (!request) return false;
    
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

  private logSuspiciousActivity(activity: any): void {
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
  private ids: IntrusionDetectionSystem;

  constructor() {
    super();
    this.ids = new IntrusionDetectionSystem();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.ids.on('intrusion-detected', (data: any) => {
      this.emit('alert', {
        type: 'intrusion',
        severity: 'high',
        ...data
      });
    });
  }

  async analyzeRequest(request: any): Promise<boolean> {
    return this.ids.analyzeRequest(request);
  }
}
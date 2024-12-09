import { EventEmitter } from 'events.js';

export class IntrusionDetectionSystem extends EventEmitter {
  private readonly patterns: Map<string, RegExp> = new Map();
  private suspiciousActivities: any[] = [];
  private readonly maxLogSize = 1000;

  constructor() {
    super();
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.patterns.set(
      'sql-injection',
      /('|"|;|--|\/\*|\*\/|=|%|@@|char|union|select|delete|drop|update|insert)/i
    );
    this.patterns.set(
      'xss',
      /<script|javascript:|onerror=|onload=|eval\(|setTimeout\(|setInterval\(/i
    );
    this.patterns.set(
      'path-traversal',
      /\.\.\/|\.\.\\|~\/|~\\|\.\.%2f|\.\.%5c/i
    );
  }

  async analyzeRequest(request: any): Promise<boolean> {
    const suspicious = await this.detectThreats(request);
    if (suspicious) {
      await this.logSuspiciousActivity(request);
      return true;
    }
    return false;
  }

  private async detectThreats(request: any): Promise<boolean> {
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

  private async logSuspiciousActivity(activity: any): Promise<void> {
    this.suspiciousActivities.push({
      ...activity,
      timestamp: Date.now()
    });

    if (this.suspiciousActivities.length > this.maxLogSize) {
      await this.archiveSuspiciousActivities();
    }
  }

  private async archiveSuspiciousActivities(): Promise<void> {
    const activitiesToArchive = this.suspiciousActivities.slice(0, -this.maxLogSize);
    this.suspiciousActivities = this.suspiciousActivities.slice(-this.maxLogSize);
  }
} 
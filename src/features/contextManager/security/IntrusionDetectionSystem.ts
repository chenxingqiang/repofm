export class IntrusionDetectionSystem {
  async analyzeRequest(request: any): Promise<boolean> {
    // Basic implementation for testing
    const suspiciousPatterns = [
      'sql injection',
      'xss',
      'command injection'
    ];

    const requestStr = JSON.stringify(request).toLowerCase();
    return suspiciousPatterns.some(pattern => requestStr.includes(pattern));
  }
} 
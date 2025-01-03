import { BehaviorAnalytics as BehaviorAnalyticsImpl } from "./BehaviorAnalytics.js";
import { IntrusionDetectionSystem as IDS } from "./types.js";
export class SecurityManager {
    constructor() {
        this.ids = new IDS();
        this.analytics = new BehaviorAnalyticsImpl();
    }
    validateToken(token) {
        // Basic token validation
        return token.length > 0 && token.startsWith('valid-');
    }
    async detectHighRiskActivities(context) {
        const riskScore = await this.analytics.calculateRiskScore(context);
        return riskScore > 0.7; // 70% threshold for high risk
    }
}
//# sourceMappingURL=securityManager.js.map
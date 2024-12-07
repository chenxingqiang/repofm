export interface AuditLog {
    timestamp: number;
    action: string;
    userId: string;
    contextId: string;
    changes: any;
    metadata: any;
}
export declare class AuditSystem {
    private logs;
    private readonly maxLogs;
    logAction(action: string, userId: string, contextId: string, changes: any): Promise<void>;
    getCurrentIP(): void;
    getUserAgent(): void;
    private persistLog;
    private archiveLogs;
    archiveToStorage(logsToArchive: AuditLog[]): void;
    queryLogs(filters: Partial<AuditLog>): Promise<AuditLog[]>;
}

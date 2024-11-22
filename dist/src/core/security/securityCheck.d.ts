export interface SuspiciousFileResult {
    filePath: string;
    messages: string[];
}
export declare const runSecurityCheck: (files: Array<{
    path: string;
    content: string;
}>) => Promise<SuspiciousFileResult[]>;
export declare function runSecretLint(filePath: string, content: string, config?: {}): Promise<{
    messages: string[];
}>;
//# sourceMappingURL=securityCheck.d.ts.map
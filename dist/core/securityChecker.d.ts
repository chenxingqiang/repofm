export interface SecurityCheck {
    isValid: boolean;
    issues: string[];
}
export declare function checkSecurity(filePath: string, content: string): SecurityCheck;
export default checkSecurity;

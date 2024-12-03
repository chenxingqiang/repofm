export interface SecurityCheck {
  isValid: boolean;
  issues: string[];
}

export function checkSecurity(filePath: string, content: string): SecurityCheck {
  const issues: string[] = [];
  
  // Basic security checks
  if (content.includes('eval(')) {
    issues.push('Contains potentially unsafe eval() usage');
  }
  
  if (content.includes('process.env')) {
    issues.push('Contains environment variable access');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export default checkSecurity; 
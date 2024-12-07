export interface AutocommitOptions {
    message?: string;
    pattern?: string;
    push?: boolean;
    branch?: string;
    remote?: string;
    all?: boolean;
    interactive?: boolean;
}
export declare function runAutocommitAction(targetDir: string, options?: AutocommitOptions): Promise<void>;

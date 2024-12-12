export declare const getPackageVersion: (pkgPath: string) => Promise<string>;
export declare const getPackageJsonPath: () => string;
export declare const getVersion: () => Promise<string>;
export declare const clearVersionCache: () => void;
export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
    [key: string]: unknown;
}
export declare function findPackageJson(startDir: string): Promise<string | null>;
export declare function parsePackageJson(filePath: string): Promise<PackageJson>;
export declare function writePackageJson(filePath: string, data: PackageJson): Promise<void>;
export declare const parsePackageJsonContent: (content: string) => Record<string, any>;

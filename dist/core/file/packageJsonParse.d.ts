export declare const getPackageVersion: (pkgPath: string) => Promise<string>;
export declare const getPackageJsonPath: () => string;
export declare const getVersion: () => Promise<string>;
export declare const clearVersionCache: () => void;
export declare const parsePackageJson: (content: string) => Record<string, any>;

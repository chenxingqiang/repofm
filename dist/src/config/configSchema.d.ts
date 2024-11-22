import { z } from 'zod';
export declare const repofmOutputStyleSchema: z.ZodEnum<["plain", "xml", "markdown"]>;
export type repofmOutputStyle = z.infer<typeof repofmOutputStyleSchema>;
export declare const defaultFilePathMap: Record<repofmOutputStyle, string>;
export declare const repofmConfigBaseSchema: z.ZodObject<{
    patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dot: z.ZodOptional<z.ZodBoolean>;
    followSymlinks: z.ZodOptional<z.ZodBoolean>;
    output: z.ZodOptional<z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodOptional<z.ZodBoolean>;
        removeEmptyLines: z.ZodOptional<z.ZodBoolean>;
        topFilesLength: z.ZodOptional<z.ZodNumber>;
        showLineNumbers: z.ZodOptional<z.ZodBoolean>;
        copyToClipboard: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodOptional<z.ZodObject<{
        useGitignore: z.ZodOptional<z.ZodBoolean>;
        useDefaultPatterns: z.ZodOptional<z.ZodBoolean>;
        customPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        enableSecurityCheck: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck?: boolean | undefined;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>;
export declare const repofmConfigDefaultSchema: z.ZodObject<{
    output: z.ZodDefault<z.ZodObject<{
        filePath: z.ZodDefault<z.ZodString>;
        style: z.ZodDefault<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodDefault<z.ZodBoolean>;
        removeEmptyLines: z.ZodDefault<z.ZodBoolean>;
        topFilesLength: z.ZodDefault<z.ZodNumber>;
        showLineNumbers: z.ZodDefault<z.ZodBoolean>;
        copyToClipboard: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        style: "plain" | "xml" | "markdown";
        removeComments: boolean;
        removeEmptyLines: boolean;
        topFilesLength: number;
        showLineNumbers: boolean;
        copyToClipboard: boolean;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodDefault<z.ZodObject<{
        useGitignore: z.ZodDefault<z.ZodBoolean>;
        useDefaultPatterns: z.ZodDefault<z.ZodBoolean>;
        customPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        useGitignore: boolean;
        useDefaultPatterns: boolean;
        customPatterns: string[];
    }, {
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodDefault<z.ZodObject<{
        enableSecurityCheck: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck: boolean;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    output: {
        filePath: string;
        style: "plain" | "xml" | "markdown";
        removeComments: boolean;
        removeEmptyLines: boolean;
        topFilesLength: number;
        showLineNumbers: boolean;
        copyToClipboard: boolean;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
    };
    include: string[];
    ignore: {
        useGitignore: boolean;
        useDefaultPatterns: boolean;
        customPatterns: string[];
    };
    security: {
        enableSecurityCheck: boolean;
    };
}, {
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>;
export declare const repofmConfigFileSchema: z.ZodObject<{
    patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dot: z.ZodOptional<z.ZodBoolean>;
    followSymlinks: z.ZodOptional<z.ZodBoolean>;
    output: z.ZodOptional<z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodOptional<z.ZodBoolean>;
        removeEmptyLines: z.ZodOptional<z.ZodBoolean>;
        topFilesLength: z.ZodOptional<z.ZodNumber>;
        showLineNumbers: z.ZodOptional<z.ZodBoolean>;
        copyToClipboard: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodOptional<z.ZodObject<{
        useGitignore: z.ZodOptional<z.ZodBoolean>;
        useDefaultPatterns: z.ZodOptional<z.ZodBoolean>;
        customPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        enableSecurityCheck: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck?: boolean | undefined;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>;
export declare const repofmConfigCliSchema: z.ZodObject<{
    patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dot: z.ZodOptional<z.ZodBoolean>;
    followSymlinks: z.ZodOptional<z.ZodBoolean>;
    output: z.ZodOptional<z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodOptional<z.ZodBoolean>;
        removeEmptyLines: z.ZodOptional<z.ZodBoolean>;
        topFilesLength: z.ZodOptional<z.ZodNumber>;
        showLineNumbers: z.ZodOptional<z.ZodBoolean>;
        copyToClipboard: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodOptional<z.ZodObject<{
        useGitignore: z.ZodOptional<z.ZodBoolean>;
        useDefaultPatterns: z.ZodOptional<z.ZodBoolean>;
        customPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        enableSecurityCheck: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck?: boolean | undefined;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>;
export declare const repofmConfigMergedSchema: z.ZodIntersection<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    output: z.ZodDefault<z.ZodObject<{
        filePath: z.ZodDefault<z.ZodString>;
        style: z.ZodDefault<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodDefault<z.ZodBoolean>;
        removeEmptyLines: z.ZodDefault<z.ZodBoolean>;
        topFilesLength: z.ZodDefault<z.ZodNumber>;
        showLineNumbers: z.ZodDefault<z.ZodBoolean>;
        copyToClipboard: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        style: "plain" | "xml" | "markdown";
        removeComments: boolean;
        removeEmptyLines: boolean;
        topFilesLength: number;
        showLineNumbers: boolean;
        copyToClipboard: boolean;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodDefault<z.ZodObject<{
        useGitignore: z.ZodDefault<z.ZodBoolean>;
        useDefaultPatterns: z.ZodDefault<z.ZodBoolean>;
        customPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        useGitignore: boolean;
        useDefaultPatterns: boolean;
        customPatterns: string[];
    }, {
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodDefault<z.ZodObject<{
        enableSecurityCheck: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck: boolean;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    output: {
        filePath: string;
        style: "plain" | "xml" | "markdown";
        removeComments: boolean;
        removeEmptyLines: boolean;
        topFilesLength: number;
        showLineNumbers: boolean;
        copyToClipboard: boolean;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
    };
    include: string[];
    ignore: {
        useGitignore: boolean;
        useDefaultPatterns: boolean;
        customPatterns: string[];
    };
    security: {
        enableSecurityCheck: boolean;
    };
}, {
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>, z.ZodObject<{
    patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dot: z.ZodOptional<z.ZodBoolean>;
    followSymlinks: z.ZodOptional<z.ZodBoolean>;
    output: z.ZodOptional<z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodOptional<z.ZodBoolean>;
        removeEmptyLines: z.ZodOptional<z.ZodBoolean>;
        topFilesLength: z.ZodOptional<z.ZodNumber>;
        showLineNumbers: z.ZodOptional<z.ZodBoolean>;
        copyToClipboard: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodOptional<z.ZodObject<{
        useGitignore: z.ZodOptional<z.ZodBoolean>;
        useDefaultPatterns: z.ZodOptional<z.ZodBoolean>;
        customPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        enableSecurityCheck: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck?: boolean | undefined;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>>, z.ZodObject<{
    patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dot: z.ZodOptional<z.ZodBoolean>;
    followSymlinks: z.ZodOptional<z.ZodBoolean>;
    output: z.ZodOptional<z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodEnum<["plain", "xml", "markdown"]>>;
        headerText: z.ZodOptional<z.ZodString>;
        instructionFilePath: z.ZodOptional<z.ZodString>;
        removeComments: z.ZodOptional<z.ZodBoolean>;
        removeEmptyLines: z.ZodOptional<z.ZodBoolean>;
        topFilesLength: z.ZodOptional<z.ZodNumber>;
        showLineNumbers: z.ZodOptional<z.ZodBoolean>;
        copyToClipboard: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }, {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    }>>;
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignore: z.ZodOptional<z.ZodObject<{
        useGitignore: z.ZodOptional<z.ZodBoolean>;
        useDefaultPatterns: z.ZodOptional<z.ZodBoolean>;
        customPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }, {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        enableSecurityCheck: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSecurityCheck?: boolean | undefined;
    }, {
        enableSecurityCheck?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}, {
    patterns?: string[] | undefined;
    dot?: boolean | undefined;
    followSymlinks?: boolean | undefined;
    output?: {
        filePath?: string | undefined;
        style?: "plain" | "xml" | "markdown" | undefined;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
        removeComments?: boolean | undefined;
        removeEmptyLines?: boolean | undefined;
        topFilesLength?: number | undefined;
        showLineNumbers?: boolean | undefined;
        copyToClipboard?: boolean | undefined;
    } | undefined;
    include?: string[] | undefined;
    ignore?: {
        patterns?: string[] | undefined;
        useGitignore?: boolean | undefined;
        useDefaultPatterns?: boolean | undefined;
        customPatterns?: string[] | undefined;
    } | undefined;
    security?: {
        enableSecurityCheck?: boolean | undefined;
    } | undefined;
}>>, z.ZodObject<{
    cwd: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cwd: string;
}, {
    cwd: string;
}>>;
export type repofmConfigDefault = z.infer<typeof repofmConfigDefaultSchema>;
export type repofmConfigFile = z.infer<typeof repofmConfigFileSchema>;
export type repofmConfigCli = z.infer<typeof repofmConfigCliSchema>;
export type repofmConfigMerged = z.infer<typeof repofmConfigMergedSchema>;
export declare const defaultConfig: {
    output: {
        filePath: string;
        style: "plain" | "xml" | "markdown";
        removeComments: boolean;
        removeEmptyLines: boolean;
        topFilesLength: number;
        showLineNumbers: boolean;
        copyToClipboard: boolean;
        headerText?: string | undefined;
        instructionFilePath?: string | undefined;
    };
    include: string[];
    ignore: {
        useGitignore: boolean;
        useDefaultPatterns: boolean;
        customPatterns: string[];
    };
    security: {
        enableSecurityCheck: boolean;
    };
};
//# sourceMappingURL=configSchema.d.ts.map
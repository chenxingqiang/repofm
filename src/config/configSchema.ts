import { z } from 'zod';

// Output style enum
export const repofmOutputStyleSchema = z.enum(['plain', 'xml', 'markdown']);
export type repofmOutputStyle = z.infer<typeof repofmOutputStyleSchema>;

// Default values map
export const defaultFilePathMap: Record<repofmOutputStyle, string> = {
  plain: 'repofm-output.txt',
  markdown: 'repofm-output.md',
  xml: 'repofm-output.xml',
} as const;

// Base config schema
export const repofmConfigBaseSchema = z.object({
  output: z
    .object({
      filePath: z.string().optional(),
      style: repofmOutputStyleSchema.optional(),
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      removeComments: z.boolean().optional(),
      removeEmptyLines: z.boolean().optional(),
      topFilesLength: z.number().optional(),
      showLineNumbers: z.boolean().optional(),
      copyToClipboard: z.boolean().optional(),
    })
    .optional(),
  include: z.array(z.string()).optional(),
  ignore: z
    .object({
      useGitignore: z.boolean().optional(),
      useDefaultPatterns: z.boolean().optional(),
      customPatterns: z.array(z.string()).optional(),
    })
    .optional(),
  security: z
    .object({
      enableSecurityCheck: z.boolean().optional(),
    })
    .optional(),
});

// Default config schema with default values
export const repofmConfigDefaultSchema = z.object({
  output: z
    .object({
      filePath: z.string().default(defaultFilePathMap.plain),
      style: repofmOutputStyleSchema.default('plain'),
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      removeComments: z.boolean().default(false),
      removeEmptyLines: z.boolean().default(false),
      topFilesLength: z.number().int().min(0).default(5),
      showLineNumbers: z.boolean().default(false),
      copyToClipboard: z.boolean().default(false),
    })
    .default({}),
  include: z.array(z.string()).default([]),
  ignore: z
    .object({
      useGitignore: z.boolean().default(true),
      useDefaultPatterns: z.boolean().default(true),
      customPatterns: z.array(z.string()).default([]),
    })
    .default({}),
  security: z
    .object({
      enableSecurityCheck: z.boolean().default(true),
    })
    .default({}),
});

export const repofmConfigFileSchema = repofmConfigBaseSchema;

export const repofmConfigCliSchema = repofmConfigBaseSchema;

export const repofmConfigMergedSchema = repofmConfigDefaultSchema
  .and(repofmConfigFileSchema)
  .and(repofmConfigCliSchema)
  .and(
    z.object({
      cwd: z.string(),
    }),
  );

export type repofmConfigDefault = z.infer<typeof repofmConfigDefaultSchema>;
export type repofmConfigFile = z.infer<typeof repofmConfigFileSchema>;
export type repofmConfigCli = z.infer<typeof repofmConfigCliSchema>;
export type repofmConfigMerged = z.infer<typeof repofmConfigMergedSchema>;

export const defaultConfig = repofmConfigDefaultSchema.parse({});

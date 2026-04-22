import * as dotenv from 'dotenv';
import { z } from 'zod';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configSchema = z.object({
  github: z.object({
    token: z.string().optional()
  }),
  supabase: z.object({
    url: z.string().optional(),
    key: z.string().optional()
  })
});

export function loadConfig() {
  // Load base config
  const configPath = path.join(__dirname, '../repofm.config.json');
  const rawConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : {};

  // Inject environment variables
  const fullConfig = {
    ...rawConfig,
    github: {
      token: process.env.GITHUB_TOKEN || '',
    },
    supabase: {
      url: process.env.SUPABASE_URL || '',
      key: process.env.SUPABASE_KEY || '',
    }
  };

  // Validate config
  return configSchema.parse(fullConfig);
}

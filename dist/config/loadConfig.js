import * as dotenv from 'dotenv.js';
import { z } from 'zod.js';
// Load environment variables
dotenv.config();
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
    const config = require('../repofm.config.json');
    // Inject environment variables
    const fullConfig = {
        ...config,
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
//# sourceMappingURL=loadConfig.js.map
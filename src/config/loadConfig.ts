import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

export function loadConfig() {
  // Load base config
  const config = require('../repofm.config.json');

  // Inject environment variables
  return {
    ...config,
    github: {
      token: process.env.GITHUB_TOKEN || '',
    },
    supabase: {
      url: process.env.SUPABASE_URL || '',
      key: process.env.SUPABASE_KEY || '',
    }
  };
}

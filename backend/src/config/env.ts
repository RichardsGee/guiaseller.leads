import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (guiaseller READ-ONLY)'),
  LEADS_DB_URL: z.string().min(1, 'LEADS_DB_URL is required (leads FULL CRUD)'),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().default('guia-seller'),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),
  JWT_EXPIRY: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // GuiaSeller backend API (for user profile sync on login)
  GUIASELLER_API_URL: z.string().default('https://back.guiaseller.com'),
  GUIASELLER_API_TOKEN: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();

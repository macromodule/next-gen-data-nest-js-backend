import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('api/v1'),
  ALLOWED_ORIGINS: z.string().default('*'),

  // Database
  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('nextgen_db'),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().default(20),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL: z.coerce.number().default(60),

  // Rate Limiter
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),

  // Swagger (Defaults to false in production for secure API exposure)
  SWAGGER_ENABLED: z.coerce.boolean().default(false),
  SWAGGER_TITLE: z.string().default('Next-Gen Data Starter API'),
  SWAGGER_DESCRIPTION: z.string().default('NestJS + Drizzle ORM + Redis API'),
  SWAGGER_VERSION: z.string().default('1.0'),
  SWAGGER_PATH: z.string().default('docs'),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `[${err.path.join('.')}] ${err.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }
  return result.data;
}

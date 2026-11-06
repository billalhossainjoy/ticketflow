import { z } from "zod";

const defaultLogLevels = {
  development: "debug",
  test: "silent",
  production: "info",
} as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),

    DATABASE_URL: z
      .url()
      .refine(
        (url) => url.startsWith("postgres://") || url.startsWith("postgresql://"),
        "Must be a PostgreSQL connection URL",
      )
      .optional(),
  })
  .transform((config) => ({
    ...config,
    LOG_LEVEL: config.LOG_LEVEL ?? defaultLogLevels[config.NODE_ENV],
  }));

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  );

  process.exit(1);
}

export const env = result.data;

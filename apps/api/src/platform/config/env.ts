import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

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

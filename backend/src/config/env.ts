import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const schema = z.object({
 NODE_ENV: z
  .enum(["development", "test", "production"])
  .default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  TOKEN_ENCRYPTION_KEY: z.string().regex(/^[a-f0-9]{64}$/i, "TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters").optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_LOGIN_CALLBACK_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().trim().min(1).optional(),
  GEMINI_API_KEY: z.string().optional()
});
const parsed = schema.superRefine((value, ctx) => {
  const githubLoginConfigured = Boolean(value.GITHUB_CLIENT_ID || value.GITHUB_CLIENT_SECRET || value.GITHUB_LOGIN_CALLBACK_URL);
  if (githubLoginConfigured) {
    for (const key of ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "GITHUB_LOGIN_CALLBACK_URL"] as const) {
      if (!value[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required for GitHub Login` });
    }
  }
  const githubConnectConfigured = Boolean(value.GITHUB_CALLBACK_URL);
  if (githubConnectConfigured) {
    for (const key of ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"] as const) {
      if (!value[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required for GitHub repository connection` });
    }
    if (!value.TOKEN_ENCRYPTION_KEY) ctx.addIssue({ code: "custom", path: ["TOKEN_ENCRYPTION_KEY"], message: "TOKEN_ENCRYPTION_KEY is required for GitHub repository connection" });
  }
  const googleConfigured = Boolean(value.GOOGLE_CLIENT_ID || value.GOOGLE_CLIENT_SECRET || value.GOOGLE_CALLBACK_URL);
  if (googleConfigured) {
    for (const key of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"] as const) {
      if (!value[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required for Google Login` });
    }
  }
}).safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;

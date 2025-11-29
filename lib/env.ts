import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  AUTH_SECRET: z.string().min(32),

  // OAuth (optional)
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url(),

  // S3 (optional for development)
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Realtime (Pusher or Ably)
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  ABLY_KEY: z.string().optional(),

  // AI (OpenAI, Anthropic, or Gemini)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(), // Alias for GOOGLE_GEMINI_API_KEY

  // Unsplash (for stock images)
  UNSPLASH_ACCESS_KEY: z.string().optional(),

  // News API
  NEWSAPI_AI_KEY: z.string().optional(),

  // Encryption
  ENCRYPTION_KEY: z.string().min(40), // Base64 encoded 32 bytes

  // Cloudinary (for media storage)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // App config
  APP_TIMEZONE: z.string().default("Europe/Madrid"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Feature flags
  ENABLE_REALTIME: z.string().transform((v) => v === "true").default("true"),
  ENABLE_AI_FEATURES: z.string().transform((v) => v === "true").default("true"),
  ENABLE_WEBHOOKS: z.string().transform((v) => v === "true").default("true"),
})

// Validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    // Create alias for backward compatibility
    if (parsed.GOOGLE_GEMINI_API_KEY && !parsed.GEMINI_API_KEY) {
      parsed.GEMINI_API_KEY = parsed.GOOGLE_GEMINI_API_KEY
    }
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:")
      console.error(error.errors.map((err) => `  - ${err.path.join(".")}: ${err.message}`).join("\n"))
      throw new Error("Invalid environment variables")
    }
    throw error
  }
}

// Export validated env object
export const env = validateEnv()

// Type export for use throughout the app
export type Env = z.infer<typeof envSchema>

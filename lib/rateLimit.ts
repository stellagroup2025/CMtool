import { connection } from "./queue"
import { createLogger } from "./logger"

const logger = createLogger("rate-limit")

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  async check(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.config.windowMs)}`

    try {
      const count = await connection.incr(windowKey)

      // Set expiry on first increment
      if (count === 1) {
        await connection.pexpire(windowKey, this.config.windowMs)
      }

      const allowed = count <= this.config.maxRequests
      const remaining = Math.max(0, this.config.maxRequests - count)
      const resetAt = Math.ceil(now / this.config.windowMs) * this.config.windowMs

      if (!allowed) {
        logger.warn({ key, count, limit: this.config.maxRequests }, "Rate limit exceeded")
      }

      return { allowed, remaining, resetAt }
    } catch (error) {
      logger.error({ error, key }, "Rate limit check failed")
      // Fail open - allow the request if Redis is down
      return { allowed: true, remaining: this.config.maxRequests, resetAt: now + this.config.windowMs }
    }
  }

  async consume(key: string): Promise<void> {
    const result = await this.check(key)
    if (!result.allowed) {
      throw new RateLimitError("Rate limit exceeded", result.resetAt)
    }
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetAt: number
  ) {
    super(message)
    this.name = "RateLimitError"
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  api: new RateLimiter({ maxRequests: 100, windowMs: 60 * 1000 }), // 100 req/min
  publish: new RateLimiter({ maxRequests: 10, windowMs: 60 * 1000 }), // 10 posts/min
  ai: new RateLimiter({ maxRequests: 20, windowMs: 60 * 1000 }), // 20 AI requests/min
}

import { Platform } from "@prisma/client"
import { SocialAdapter, AdapterRegistry } from "./types"
import { instagramAdapter } from "./instagram"
import { facebookAdapter } from "./facebook"
import { twitterAdapter } from "./twitter"

// Stub adapters for platforms not yet implemented
import { createLogger } from "../logger"

const logger = createLogger("social")

class StubAdapter implements SocialAdapter {
  constructor(public platform: Platform) {}

  async getAccount() {
    throw new Error(`${this.platform} adapter not yet implemented`)
  }

  async publish() {
    throw new Error(`${this.platform} adapter not yet implemented`)
  }

  async delete() {
    throw new Error(`${this.platform} adapter not yet implemented`)
  }

  async fetchMetrics() {
    throw new Error(`${this.platform} adapter not yet implemented`)
  }

  async reply() {
    throw new Error(`${this.platform} adapter not yet implemented`)
  }
}

// Social adapter registry
export const adapters: AdapterRegistry = {
  [Platform.INSTAGRAM]: instagramAdapter,
  [Platform.FACEBOOK]: facebookAdapter,
  [Platform.X]: twitterAdapter,
  [Platform.TIKTOK]: new StubAdapter(Platform.TIKTOK),
  [Platform.LINKEDIN]: new StubAdapter(Platform.LINKEDIN),
  [Platform.YOUTUBE]: new StubAdapter(Platform.YOUTUBE),
}

export function getAdapter(platform: Platform): SocialAdapter {
  const adapter = adapters[platform]
  if (!adapter) {
    throw new Error(`No adapter found for platform: ${platform}`)
  }
  return adapter
}

// Re-export types
export * from "./types"

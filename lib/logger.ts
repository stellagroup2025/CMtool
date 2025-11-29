import pino from "pino"

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Disabled pino-pretty to avoid worker thread crashes
  transport: undefined,
})

export function createLogger(name: string) {
  return logger.child({ name })
}

export default logger

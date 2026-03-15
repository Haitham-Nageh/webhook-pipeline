import pino from 'pino'

// Structured logger used throughout the application.
// In development: pretty-printed with colors and timestamps.
// In production: raw JSON output for easy parsing by log aggregators.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname', // reduce noise in development
          },
        }
      : undefined,
})
import { startWorker } from './worker/index'
import { logger } from './lib/logger'

// Handle unexpected errors that were not caught anywhere in the worker process.
// Logging before exit ensures the error is recorded before the process dies.
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled rejection')
  process.exit(1)
})

logger.info('Starting worker process')
startWorker()
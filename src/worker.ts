import { startWorker } from './worker/index'
import { logger } from './lib/logger'

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
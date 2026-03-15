import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { processJob } from './processor'

// How often the worker checks for new pending jobs (in milliseconds)
const POLL_INTERVAL = 2000

/*
  Polls the database for the oldest PENDING job and processes it.
  Uses a finally block to guarantee the next poll is always scheduled,
  even if an error occurs — preventing the worker loop from stopping.
 */
const pollJobs = async (): Promise<void> => {
  try {
    // Always pick the oldest pending job first (FIFO order)
    const job = await prisma.job.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    })

    if (job) {
      logger.info({ jobId: job.id }, 'Job picked up by worker')
      await processJob(job.id)
    }
  } catch (err) {
    logger.error({ err }, 'Worker poll error')
  } finally {
    // Schedule the next poll regardless of success or failure
    setTimeout(pollJobs, POLL_INTERVAL)
  }
}

export const startWorker = (): void => {
  logger.info('Worker started')
  void pollJobs()
}
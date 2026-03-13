import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { processJob } from './processor'

const POLL_INTERVAL = 2000

const pollJobs = async (): Promise<void> => {
  try {
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
    setTimeout(pollJobs, POLL_INTERVAL)
  }
}

export const startWorker = (): void => {
  logger.info('Worker started')
  void pollJobs()
}
import { Prisma } from '@prisma/client'
import { actions } from '../actions'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { deliver } from './delivery'

export const processJob = async (jobId: string): Promise<void> => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      pipeline: {
        include: { subscribers: true },
      },
    },
  })

  if (!job) {
    logger.warn({ jobId }, 'Job not found')
    return
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      startedAt: new Date(),
      errorMessage: null,
    },
  })

  logger.info({ jobId }, 'Job processing started')

  try {
    const actionFn = actions[job.pipeline.processingType]

    if (!actionFn) {
      throw new Error(`Unknown action: ${job.pipeline.processingType}`)
    }

    const payload = job.payload as Record<string, unknown>
    const config = job.pipeline.config as Record<string, unknown> | null
    const processedPayload = actionFn(payload, config)

    await prisma.job.update({
      where: { id: jobId },
      data: {
        processedPayload: processedPayload as Prisma.InputJsonValue,
      },
    })

    logger.info({ jobId }, 'Job payload processed')

    const deliverySucceeded = await deliver(
      job.id,
      job.pipeline.subscribers,
      processedPayload
    )

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: deliverySucceeded ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        errorMessage: deliverySucceeded ? null : 'One or more deliveries failed',
      },
    })

    logger.info(
      { jobId, deliverySucceeded },
      'Job processing finished'
    )
  } catch (err) {
    logger.error({ err, jobId }, 'Job processing failed')

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        completedAt: new Date(),
      },
    })
  }
}
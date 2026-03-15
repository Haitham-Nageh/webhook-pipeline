import { Prisma } from '@prisma/client'
import { actions } from '../actions'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { deliver } from './delivery'

/*
  Processes a single job through its full lifecycle:
  PENDING → PROCESSING → (action runs) → delivery → COMPLETED or FAILED
  The job status is updated at each stage so the API always reflects
  the real state of the job.
 */
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

  // Mark job as PROCESSING so other workers don't pick it up
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
    // Look up the action function by the pipeline's processing type
    const actionFn = actions[job.pipeline.processingType]

    if (!actionFn) {
      throw new Error(`Unknown action: ${job.pipeline.processingType}`)
    }

    // Run the processing action on the incoming payload
    const payload = job.payload as Record<string, unknown>
    const config = job.pipeline.config as Record<string, unknown> | null
    const processedPayload = actionFn(payload, config)

    // Save processed payload before attempting delivery
    // so it's available even if delivery fails
    await prisma.job.update({
      where: { id: jobId },
      data: {
        processedPayload: processedPayload as Prisma.InputJsonValue,
      },
    })

    logger.info({ jobId }, 'Job payload processed')

    // Deliver the processed result to all subscribers
    const deliverySucceeded = await deliver(
      job.id,
      job.pipeline.subscribers,
      processedPayload
    )

    // Job is COMPLETED only if all subscribers received the result
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: deliverySucceeded ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        errorMessage: deliverySucceeded ? null : 'One or more deliveries failed',
      },
    })

    logger.info({ jobId, deliverySucceeded }, 'Job processing finished')

  } catch (err) {
    logger.error({ err, jobId }, 'Job processing failed')

    // Mark job as FAILED and store the error message for debugging
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
import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { WebhookPayloadSchema } from '../schemas/webhook.schema'

export const webhooksRouter = Router()

webhooksRouter.post('/:sourceKey', async (req: Request, res: Response) => {
  try {
    const result = WebhookPayloadSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload — must be a JSON object',
      })
    }

    const sourceKey = String(req.params.sourceKey)

    const pipeline = await prisma.pipeline.findUnique({
      where: { sourceKey },
    })

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        error: 'Pipeline not found',
      })
    }

    if (!pipeline.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Pipeline is inactive',
      })
    }

    const job = await prisma.job.create({
      data: {
        pipelineId: pipeline.id,
        payload: result.data as Prisma.InputJsonValue,
        status: 'PENDING',
      },
    })

    logger.info(
      {
        jobId: job.id,
        pipelineId: pipeline.id,
        sourceKey,
      },
      'Webhook received and job queued'
    )

    return res.status(202).json({
      success: true,
      data: {
        jobId: job.id,
        status: 'accepted',
        message: 'Webhook accepted and queued for processing',
      },
    })
  } catch (err) {
    logger.error({ err }, 'Failed to ingest webhook')

    return res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    })
  }
})
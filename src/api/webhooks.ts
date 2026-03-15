import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { WebhookPayloadSchema } from '../schemas/webhook.schema'

export const webhooksRouter = Router()

// ─── POST /webhooks/:sourceKey ────────────────────────────
// The main entry point for external events.
// Validates the payload, finds the pipeline, creates a job, and returns immediately.
// Processing happens asynchronously in the worker — not here.
webhooksRouter.post('/:sourceKey', async (req: Request, res: Response) => {
  try {
    // Validate that the payload is a JSON object
    const result = WebhookPayloadSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload — must be a JSON object',
      })
    }

    const sourceKey = String(req.params.sourceKey)

    // Look up the pipeline by its unique source key
    const pipeline = await prisma.pipeline.findUnique({
      where: { sourceKey },
    })

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        error: 'Pipeline not found',
      })
    }

    // Reject webhooks for inactive pipelines
    if (!pipeline.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Pipeline is inactive',
      })
    }

    // Create the job with PENDING status — the worker will pick it up
    const job = await prisma.job.create({
      data: {
        pipelineId: pipeline.id,
        payload: result.data as Prisma.InputJsonValue,
        status: 'PENDING',
      },
    })

    logger.info(
      { jobId: job.id, pipelineId: pipeline.id, sourceKey },
      'Webhook received and job queued'
    )

    // Return 202 Accepted — the request was received but not yet processed
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
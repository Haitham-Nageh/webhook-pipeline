import { randomBytes } from 'crypto'
import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import {
  CreatePipelineSchema,
  UpdatePipelineSchema,
} from '../schemas/pipeline.schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toJson = (val: unknown): any => val

export const pipelinesRouter = Router()

// Generates a random 32-character hex string used as the pipeline's webhook URL key.
// Example: /webhooks/a3f8c2d1e4b5a6f7c8d9e0f1a2b3c4d5
const generateSourceKey = () => randomBytes(16).toString('hex')

// ─── GET /pipelines ───────────────────────────────────────
// Returns all pipelines ordered by creation date (newest first)
pipelinesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: { subscribers: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: pipelines })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch pipelines')
    res.status(500).json({ success: false, error: 'Failed to fetch pipelines' })
  }
})

// ─── GET /pipelines/:id ───────────────────────────────────
pipelinesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: req.params.id as string },
      include: { subscribers: true },
    })

    if (!pipeline) {
      res.status(404).json({ success: false, error: 'Pipeline not found' })
      return
    }

    res.json({ success: true, data: pipeline })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch pipeline')
    res.status(500).json({ success: false, error: 'Failed to fetch pipeline' })
  }
})

// ─── POST /pipelines ──────────────────────────────────────
// Creates a pipeline with a unique sourceKey and one or more subscribers.
// Subscribers are created in the same transaction via Prisma nested writes.
pipelinesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const result = CreatePipelineSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.flatten() })
      return
    }

    const { name, processingType, config, isActive, subscribers } = result.data

    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        sourceKey: generateSourceKey(),
        processingType,
        // Prisma requires JsonNull for nullable JSON fields instead of null
        config: config !== undefined ? toJson(config) : Prisma.JsonNull,
        isActive: isActive ?? true,
        subscribers: {
          create: subscribers.map((url) => ({ targetUrl: url })),
        },
      },
      include: { subscribers: true },
    })

    logger.info({ pipelineId: pipeline.id }, 'Pipeline created')

    // Include the full webhook URL in the response so the caller
    // knows immediately where to send events
    res.status(201).json({
      success: true,
      data: {
        ...pipeline,
        webhookUrl: `/webhooks/${pipeline.sourceKey}`,
      },
    })
  } catch (err) {
    logger.error({ err }, 'Failed to create pipeline')
    res.status(500).json({ success: false, error: 'Failed to create pipeline' })
  }
})

// ─── PATCH /pipelines/:id ─────────────────────────────────
// Partial update — only provided fields are changed.
// Subscribers are not updated here to keep the operation simple.
pipelinesRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const result = UpdatePipelineSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.flatten() })
      return
    }

    const existing = await prisma.pipeline.findUnique({
      where: { id: req.params.id as string },
    })

    if (!existing) {
      res.status(404).json({ success: false, error: 'Pipeline not found' })
      return
    }

    // Separate config from the rest to handle JSON casting correctly
    const { config, ...rest } = result.data

    const pipeline = await prisma.pipeline.update({
      where: { id: req.params.id as string },
      data: {
        ...rest,
        ...(config !== undefined && { config: toJson(config) }),
      },
      include: { subscribers: true },
    })

    logger.info({ pipelineId: pipeline.id }, 'Pipeline updated')
    res.json({ success: true, data: pipeline })
  } catch (err) {
    logger.error({ err }, 'Failed to update pipeline')
    res.status(500).json({ success: false, error: 'Failed to update pipeline' })
  }
})

// ─── DELETE /pipelines/:id ────────────────────────────────
// Deleting a pipeline cascades to subscribers and jobs
// because of the onDelete: Cascade set in the Prisma schema
pipelinesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.pipeline.findUnique({
      where: { id: req.params.id as string },
    })

    if (!existing) {
      res.status(404).json({ success: false, error: 'Pipeline not found' })
      return
    }

    await prisma.pipeline.delete({
      where: { id: req.params.id as string },
    })

    logger.info({ pipelineId: req.params.id }, 'Pipeline deleted')
    res.json({ success: true, data: { message: 'Pipeline deleted' } })
  } catch (err) {
    logger.error({ err }, 'Failed to delete pipeline')
    res.status(500).json({ success: false, error: 'Failed to delete pipeline' })
  }
})
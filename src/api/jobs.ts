import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { JobQuerySchema } from '../schemas/job.schema'

export const jobsRouter = Router()

jobsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = JobQuerySchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.flatten(),
      })
    }

    const { status, page, limit } = result.data
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          pipeline: {
            select: { name: true, processingType: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ])

    return res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch jobs')
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
    })
  }
})

jobsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.id)

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        pipeline: {
          select: {
            name: true,
            processingType: true,
            sourceKey: true,
          },
        },
        deliveryAttempts: {
          orderBy: { attemptedAt: 'asc' },
          include: {
            subscriber: {
              select: { targetUrl: true },
            },
          },
        },
      },
    })

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      })
    }

    return res.json({ success: true, data: job })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch job')
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
    })
  }
})

jobsRouter.get('/:id/deliveries', async (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.id)

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      })
    }

    const deliveries = await prisma.deliveryAttempt.findMany({
      where: { jobId },
      orderBy: { attemptedAt: 'asc' },
      include: {
        subscriber: {
          select: { targetUrl: true },
        },
      },
    })

    return res.json({ success: true, data: deliveries })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch deliveries')
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch deliveries',
    })
  }
})
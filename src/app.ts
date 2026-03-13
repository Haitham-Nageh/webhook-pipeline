import express, { NextFunction, Request, Response } from 'express'
import { logger } from './lib/logger'
import { pipelinesRouter } from './api/pipelines'
import { webhooksRouter } from './api/webhooks'
import { jobsRouter } from './api/jobs'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request')
  next()
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/pipelines', pipelinesRouter)
app.use('/webhooks', webhooksRouter)
app.use('/jobs', jobsRouter)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error')

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

export default app
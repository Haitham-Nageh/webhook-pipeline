import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { logger } from './lib/logger'
import { pipelinesRouter } from './api/pipelines'
import { webhooksRouter } from './api/webhooks'
import { jobsRouter } from './api/jobs'
import { apiLimiter, webhookLimiter } from './middleware/rateLimiter'

const app = express()

// Allow requests from the React dashboard during development
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}))

// Trust the first proxy so rate limiting uses the real client IP
// instead of the proxy's IP (important in Docker / production)
app.set('trust proxy', 1)

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log every incoming request for observability
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request')
  next()
})

// Health check endpoint — used by Docker and CI to verify the service is up
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes — each group has its own rate limiter
// Webhooks have a stricter limit since each request creates a job
app.use('/pipelines', apiLimiter, pipelinesRouter)
app.use('/webhooks', webhookLimiter, webhooksRouter)
app.use('/jobs', apiLimiter, jobsRouter)

// Catch-all for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// Global error handler — catches any unhandled errors thrown in route handlers
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error')
  res.status(500).json({ success: false, error: 'Internal server error' })
})

export default app
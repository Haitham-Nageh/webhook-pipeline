import rateLimit from 'express-rate-limit'

// Protects general API endpoints (pipelines, jobs) from abuse.
// Allows 100 requests per IP every 15 minutes.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // disable X-RateLimit-* headers
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    })
  },
})

// Stricter limit for webhook ingestion since each request creates a job
// and triggers background processing. Allows 30 webhooks per IP per minute.
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many webhooks, please slow down',
    })
  },
})
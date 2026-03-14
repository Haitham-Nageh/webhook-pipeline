import rateLimit from 'express-rate-limit'

// ─── General API Limiter ──────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    })
  },
})

// ─── Webhook Limiter ─────────────────────────────────────
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
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
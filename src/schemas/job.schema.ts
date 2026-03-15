import { z } from 'zod'
import { JOB_STATUSES } from '../types/common'

// Validates query parameters for GET /jobs
// z.coerce.number() is used because query params arrive as strings from the URL
// e.g. ?page=2&limit=10 → "2" and "10" get coerced to numbers automatically
export const JobQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type JobQuery = z.infer<typeof JobQuerySchema>
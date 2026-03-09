import { z } from 'zod'
import { JOB_STATUSES } from '../types/common'

export const JobQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type JobQuery = z.infer<typeof JobQuerySchema>
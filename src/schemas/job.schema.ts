import { z } from 'zod'

export const JobQuerySchema = z.object({
  status: z
    .enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
    .optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type JobQuery = z.infer<typeof JobQuerySchema>
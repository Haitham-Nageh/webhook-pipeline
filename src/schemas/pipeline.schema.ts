import { z } from 'zod'
import { PROCESSING_TYPES } from '../types/common'

// Validates the request body for POST /pipelines
export const CreatePipelineSchema = z.object({
  name: z.string().min(1, 'Name is required'),

  // Restricts processingType to the known action types defined in common.ts
  processingType: z.enum(PROCESSING_TYPES),

  // Optional action-specific config (e.g. which fields to redact)
  config: z.record(z.string(), z.unknown()).optional(),

  isActive: z.boolean().optional(),

  // At least one subscriber URL is required to deliver results
  subscribers: z
    .array(z.url('Each subscriber must be a valid URL'))
    .min(1, 'At least one subscriber is required'),
})

// Validates the request body for PATCH /pipelines/:id
// All fields are optional since it's a partial update,
// but at least one must be provided to prevent empty updates
export const UpdatePipelineSchema = z
  .object({
    name: z.string().min(1).optional(),
    processingType: z.enum(PROCESSING_TYPES).optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  })

// Infer TypeScript types directly from schemas to avoid duplication
export type CreatePipelineInput = z.infer<typeof CreatePipelineSchema>
export type UpdatePipelineInput = z.infer<typeof UpdatePipelineSchema>
import { z } from 'zod'
import { PROCESSING_TYPES } from '../types/common'

export const CreatePipelineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  processingType: z.enum(PROCESSING_TYPES),
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  subscribers: z
    .array(z.string().url('Each subscriber must be a valid URL'))
    .min(1, 'At least one subscriber is required'),
})

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

export type CreatePipelineInput = z.infer<typeof CreatePipelineSchema>
export type UpdatePipelineInput = z.infer<typeof UpdatePipelineSchema>
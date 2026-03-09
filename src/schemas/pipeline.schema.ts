import { z } from 'zod'

export const CreatePipelineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  processingType: z.enum([
    'metadata_enrichment',
    'sensitive_field_redaction',
    'event_annotation',
  ]),
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  subscribers: z
    .array(z.string().url('Each subscriber must be a valid URL'))
    .min(1, 'At least one subscriber is required'),
})

export const UpdatePipelineSchema = z.object({
  name: z.string().min(1).optional(),
  processingType: z
    .enum([
      'metadata_enrichment',
      'sensitive_field_redaction',
      'event_annotation',
    ])
    .optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
})

export type CreatePipelineInput = z.infer<typeof CreatePipelineSchema>
export type UpdatePipelineInput = z.infer<typeof UpdatePipelineSchema>
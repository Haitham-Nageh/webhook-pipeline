import type { UUID, ProcessingType } from './common'

// Mirrors the Pipeline table in the database
export interface Pipeline {
  id: UUID
  name: string
  sourceKey: string        // unique random key used in the webhook URL: /webhooks/:sourceKey
  processingType: ProcessingType
  config: Record<string, unknown> | null  // optional action-specific settings (e.g. fields to redact)
  isActive: boolean        // inactive pipelines reject incoming webhooks with 403
  createdAt: Date
  updatedAt: Date
}

// Mirrors the Subscriber table — each pipeline can have multiple subscribers
export interface Subscriber {
  id: UUID
  pipelineId: UUID
  targetUrl: string        // URL that receives the processed payload after delivery
  createdAt: Date
}

// Input shape for POST /pipelines
export interface CreatePipelineInput {
  name: string
  processingType: ProcessingType
  config?: Record<string, unknown>
  subscribers: string[]    // list of target URLs, at least one required
  isActive?: boolean       // defaults to true if not provided
}

// Input shape for PATCH /pipelines/:id — all fields optional
export interface UpdatePipelineInput {
  name?: string
  processingType?: ProcessingType
  config?: Record<string, unknown>
  isActive?: boolean
}
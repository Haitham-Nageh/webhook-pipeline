import { UUID } from './common'

export type ProcessingType =
  | 'metadata_enrichment'
  | 'sensitive_field_redaction'
  | 'event_annotation'

export interface Pipeline {
  id: UUID
  name: string
  sourceKey: string
  processingType: ProcessingType
  config: Record<string, unknown> | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subscriber {
  id: UUID
  pipelineId: UUID
  targetUrl: string
  createdAt: Date
}

export interface CreatePipelineInput {
  name: string
  processingType: ProcessingType
  config?: Record<string, unknown>
  subscribers: string[]    
}

export interface UpdatePipelineInput {
  name?: string
  processingType?: ProcessingType
  config?: Record<string, unknown>
  isActive?: boolean
}
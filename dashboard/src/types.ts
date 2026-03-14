export type ProcessingType =
  | 'metadata_enrichment'
  | 'sensitive_field_redaction'
  | 'event_annotation'

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Subscriber {
  id: string
  targetUrl: string
  pipelineId: string
}

export interface Pipeline {
  id: string
  name: string
  sourceKey: string
  processingType: ProcessingType
  config: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  subscribers: Subscriber[]
}

export interface Job {
  id: string
  pipelineId: string
  payload: Record<string, unknown>
  processedPayload: Record<string, unknown> | null
  status: JobStatus
  errorMessage: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  pipeline?: { name: string; processingType: string; sourceKey: string }
}

export interface DeliveryAttempt {
  id: string
  attemptNumber: number
  status: 'SUCCESS' | 'FAILED'
  responseStatus: number | null
  errorMessage: string | null
  attemptedAt: string
  subscriber: { targetUrl: string }
}
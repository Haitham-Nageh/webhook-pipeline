export type UUID = string

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
}

export const PROCESSING_TYPES = [
  'metadata_enrichment',
  'sensitive_field_redaction',
  'event_annotation',
] as const

export type ProcessingType = (typeof PROCESSING_TYPES)[number]

export const JOB_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export const DELIVERY_STATUSES = ['SUCCESS', 'FAILED'] as const

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]
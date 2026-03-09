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

export type ProcessingType =
  | 'metadata_enrichment'
  | 'sensitive_field_redaction'
  | 'event_annotation'

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type DeliveryStatus = 'SUCCESS' | 'FAILED'
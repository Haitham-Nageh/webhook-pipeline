// Shared types, constants, and enums used across the entire application.
// Keeping them here avoids duplication between API, worker, and validation layers.

// Alias for clarity — all IDs in this project are UUIDs
export type UUID = string

// Standard API response wrapper used by all endpoints
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Reusable pagination parameters for list endpoints
export interface PaginationQuery {
  page?: number
  limit?: number
}

// Using "as const" arrays instead of enums so the same values
// can be used in both TypeScript types and Zod validation schemas
// without duplication
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
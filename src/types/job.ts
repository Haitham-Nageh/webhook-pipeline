import type { UUID, JobStatus, DeliveryStatus, PaginationQuery } from './common'

// Mirrors the Job table in the database
export interface Job {
  id: UUID
  pipelineId: UUID
  payload: Record<string, unknown>         // original incoming webhook data
  processedPayload: Record<string, unknown> | null  // result after action runs
  status: JobStatus
  errorMessage: string | null              // populated if processing or delivery fails
  createdAt: Date
  startedAt: Date | null                   // when the worker picked it up
  completedAt: Date | null                 // when processing + delivery finished
  updatedAt: Date
}

// Mirrors the DeliveryAttempt table — one record per delivery try per subscriber
export interface DeliveryAttempt {
  id: UUID
  jobId: UUID
  subscriberId: UUID
  attemptNumber: number                    // 1-based retry counter
  status: DeliveryStatus
  responseStatus: number | null            // HTTP status code from subscriber
  errorMessage: string | null
  attemptedAt: Date
  nextRetryAt: Date | null                 // null after final attempt
}

// Used when fetching a job with its full delivery history
export interface JobWithDeliveries extends Job {
  deliveryAttempts: DeliveryAttempt[]
}

// Query params for GET /jobs
export interface JobsQuery extends PaginationQuery {
  status?: JobStatus
}

// Extended query for filtering jobs by pipeline
export interface PipelineJobsQuery extends PaginationQuery {
  status?: JobStatus
  pipelineId?: UUID
}
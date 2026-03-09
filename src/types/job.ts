import { UUID } from './common'

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type DeliveryStatus = 'SUCCESS' | 'FAILED'

export interface Job {
  id: UUID
  pipelineId: UUID
  payload: Record<string, unknown>
  processedPayload: Record<string, unknown> | null
  status: JobStatus
  errorMessage: string | null
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  updatedAt: Date
}

export interface DeliveryAttempt {
  id: UUID
  jobId: UUID
  subscriberId: UUID
  attemptNumber: number
  status: DeliveryStatus
  responseStatus: number | null
  errorMessage: string | null
  attemptedAt: Date
  nextRetryAt: Date | null
}

export interface JobWithDeliveries extends Job {
  deliveryAttempts: DeliveryAttempt[]
}
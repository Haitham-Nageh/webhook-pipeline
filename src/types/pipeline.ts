import { UUID, ProcessingType } from './common'

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
  isActive?: boolean
}

export interface UpdatePipelineInput {
  name?: string
  processingType?: ProcessingType
  config?: Record<string, unknown>
  isActive?: boolean
}
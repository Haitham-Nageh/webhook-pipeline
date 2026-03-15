import type { ProcessingType } from '../types/common'
import { eventAnnotationAction } from './event-annotation'
import { metadataEnrichmentAction } from './metadata-enrichment'
import { sensitiveFieldRedactionAction } from './sensitive-field-redaction'

// The ActionFn type defines the contract every action must follow:
// - Takes the raw payload and optional pipeline config
// - Returns the transformed payload
export type ActionFn = (
  payload: Record<string, unknown>,
  config: Record<string, unknown> | null
) => Record<string, unknown>

// Registry that maps each processing type to its action function.
// When a new action is needed, add it here and create its file in this folder.
export const actions: Record<ProcessingType, ActionFn> = {
  metadata_enrichment: metadataEnrichmentAction,
  sensitive_field_redaction: sensitiveFieldRedactionAction,
  event_annotation: eventAnnotationAction,
}
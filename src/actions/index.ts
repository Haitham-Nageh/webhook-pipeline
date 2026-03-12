import type { ProcessingType } from '../types/common'
import { eventAnnotationAction } from './event-annotation'
import { metadataEnrichmentAction } from './metadata-enrichment'
import { sensitiveFieldRedactionAction } from './sensitive-field-redaction'

export type ActionFn = (
  payload: Record<string, unknown>,
  config: Record<string, unknown> | null
) => Record<string, unknown>

export const actions: Record<ProcessingType, ActionFn> = {
  metadata_enrichment: metadataEnrichmentAction,
  sensitive_field_redaction: sensitiveFieldRedactionAction,
  event_annotation: eventAnnotationAction,
}
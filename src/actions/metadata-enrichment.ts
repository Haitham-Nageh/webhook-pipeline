import type { ActionFn } from './index'

// Enriches the payload with processing metadata.
// Useful for tracking when and by whom the data was processed.
//
// Example:
//   Input:  { "event": "order_created", "customer": "Ali" }
//   Output: { "event": "order_created", "customer": "Ali",
//              "_metadata": { "processedAt": "...", "processedBy": "webhook-pipeline" } }
export const metadataEnrichmentAction: ActionFn = (payload, _config) => {
  return {
    ...payload,
    _metadata: {
      processedAt: new Date().toISOString(),
      processedBy: 'webhook-pipeline',
    },
  }
}
import type { ActionFn } from './index'

export const metadataEnrichmentAction: ActionFn = (payload, _config) => {
  return {
    ...payload,
    _metadata: {
      processedAt: new Date().toISOString(),
      processedBy: 'webhook-pipeline',
    },
  }
}
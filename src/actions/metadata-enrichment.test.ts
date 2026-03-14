import { describe, it, expect } from 'vitest'
import { metadataEnrichmentAction } from './metadata-enrichment'

describe('metadataEnrichmentAction', () => {
  it('adds _metadata to payload', () => {
    const payload = { event: 'order_created', customer: 'Ali' }
    const result = metadataEnrichmentAction(payload, null)

    expect(result.event).toBe('order_created')
    expect(result.customer).toBe('Ali')
    expect(result._metadata).toBeDefined()
    expect((result._metadata as Record<string, unknown>).processedBy).toBe('webhook-pipeline')
    expect((result._metadata as Record<string, unknown>).processedAt).toBeDefined()
  })

  it('preserves all original fields', () => {
    const payload = { a: 1, b: 'test', c: true }
    const result = metadataEnrichmentAction(payload, null)

    expect(result.a).toBe(1)
    expect(result.b).toBe('test')
    expect(result.c).toBe(true)
  })
})
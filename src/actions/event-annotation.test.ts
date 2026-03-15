import { describe, it, expect } from 'vitest'
import { eventAnnotationAction } from './event-annotation'

describe('eventAnnotationAction', () => {
  it('adds _annotation to payload', () => {
    const payload = { eventType: 'build_failed', service: 'api' }
    const result = eventAnnotationAction(payload, null)

    // Original fields should be preserved
    expect(result.eventType).toBe('build_failed')

    // Annotation block should be added
    expect(result._annotation).toBeDefined()
  })

  it('detects warning mood for failed events', () => {
    // "failed" keyword in event type should map to "warning" mood
    const payload = { eventType: 'build_failed' }
    const result = eventAnnotationAction(payload, null)
    const annotation = result._annotation as Record<string, unknown>

    expect(annotation.mood).toBe('warning')
  })

  it('detects success mood for success events', () => {
    // "success" keyword in event type should map to "success" mood
    const payload = { eventType: 'deployment_success' }
    const result = eventAnnotationAction(payload, null)
    const annotation = result._annotation as Record<string, unknown>

    expect(annotation.mood).toBe('success')
  })

  it('uses custom tag from config', () => {
    // Pipeline config can override the default "system-event" tag
    const payload = { eventType: 'test' }
    const result = eventAnnotationAction(payload, { defaultTag: 'custom-tag' })
    const annotation = result._annotation as Record<string, unknown>

    expect(annotation.tag).toBe('custom-tag')
  })
})
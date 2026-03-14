import { describe, it, expect } from 'vitest'
import { eventAnnotationAction } from './event-annotation'

describe('eventAnnotationAction', () => {
  it('adds _annotation to payload', () => {
    const payload = { eventType: 'build_failed', service: 'api' }
    const result = eventAnnotationAction(payload, null)

    expect(result.eventType).toBe('build_failed')
    expect(result._annotation).toBeDefined()
  })

  it('detects warning mood for failed events', () => {
    const payload = { eventType: 'build_failed' }
    const result = eventAnnotationAction(payload, null)
    const annotation = result._annotation as Record<string, unknown>

    expect(annotation.mood).toBe('warning')
  })

  it('detects success mood for success events', () => {
    const payload = { eventType: 'deployment_success' }
    const result = eventAnnotationAction(payload, null)
    const annotation = result._annotation as Record<string, unknown>

    expect(annotation.mood).toBe('success')
  })

  it('uses custom tag from config', () => {
    const payload = { eventType: 'test' }
    const result = eventAnnotationAction(payload, { defaultTag: 'custom-tag' })
    const annotation = result._annotation as Record<string, unknown>

    expect(annotation.tag).toBe('custom-tag')
  })
})
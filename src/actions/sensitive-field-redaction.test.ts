import { describe, it, expect } from 'vitest'
import { sensitiveFieldRedactionAction } from './sensitive-field-redaction'

describe('sensitiveFieldRedactionAction', () => {
  it('redacts default sensitive fields', () => {
    const payload = { name: 'Ali', password: '123456', token: 'abc' }
    const result = sensitiveFieldRedactionAction(payload, null)

    // Non-sensitive fields should be unchanged
    expect(result.name).toBe('Ali')

    // Sensitive fields should be replaced with [REDACTED]
    expect(result.password).toBe('[REDACTED]')
    expect(result.token).toBe('[REDACTED]')
  })

  it('redacts custom fields from config', () => {
    // Pipeline config can override the default list of sensitive fields
    const payload = { name: 'Ali', phone: '0599000000' }
    const result = sensitiveFieldRedactionAction(payload, { fields: ['phone'] })

    expect(result.name).toBe('Ali')
    expect(result.phone).toBe('[REDACTED]')
  })

  it('handles nested objects', () => {
    // Redaction should apply recursively to nested objects
    const payload = { user: { name: 'Ali', password: '123' } }
    const result = sensitiveFieldRedactionAction(payload, null)

    expect((result.user as Record<string, unknown>).name).toBe('Ali')
    expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]')
  })

  it('handles arrays', () => {
    // Redaction should apply to objects inside arrays
    const payload = { users: [{ name: 'Ali', password: '123' }] }
    const result = sensitiveFieldRedactionAction(payload, null)
    const users = result.users as Record<string, unknown>[]

    expect(users[0].name).toBe('Ali')
    expect(users[0].password).toBe('[REDACTED]')
  })
})
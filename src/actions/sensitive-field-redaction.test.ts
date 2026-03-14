import { describe, it, expect } from 'vitest'
import { sensitiveFieldRedactionAction } from './sensitive-field-redaction'

describe('sensitiveFieldRedactionAction', () => {
  it('redacts default sensitive fields', () => {
    const payload = { name: 'Ali', password: '123456', token: 'abc' }
    const result = sensitiveFieldRedactionAction(payload, null)

    expect(result.name).toBe('Ali')
    expect(result.password).toBe('[REDACTED]')
    expect(result.token).toBe('[REDACTED]')
  })

  it('redacts custom fields from config', () => {
    const payload = { name: 'Ali', phone: '0599000000' }
    const result = sensitiveFieldRedactionAction(payload, { fields: ['phone'] })

    expect(result.name).toBe('Ali')
    expect(result.phone).toBe('[REDACTED]')
  })

  it('handles nested objects', () => {
    const payload = { user: { name: 'Ali', password: '123' } }
    const result = sensitiveFieldRedactionAction(payload, null)

    expect((result.user as Record<string, unknown>).name).toBe('Ali')
    expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]')
  })

  it('handles arrays', () => {
    const payload = { users: [{ name: 'Ali', password: '123' }] }
    const result = sensitiveFieldRedactionAction(payload, null)
    const users = result.users as Record<string, unknown>[]

    expect(users[0].name).toBe('Ali')
    expect(users[0].password).toBe('[REDACTED]')
  })
})
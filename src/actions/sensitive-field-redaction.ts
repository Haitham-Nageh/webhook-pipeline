import type { ActionFn } from './index'

const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'creditCard',
  'ssn',
  'apiKey',
]

const redactValue = (
  value: unknown,
  fieldsToRedact: string[]
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, fieldsToRedact))
  }

  if (typeof value === 'object' && value !== null) {
    const redactedObject: Record<string, unknown> = {}

    for (const [key, nestedValue] of Object.entries(value)) {
      if (fieldsToRedact.includes(key)) {
        redactedObject[key] = '[REDACTED]'
      } else {
        redactedObject[key] = redactValue(nestedValue, fieldsToRedact)
      }
    }

    return redactedObject
  }

  return value
}

export const sensitiveFieldRedactionAction: ActionFn = (payload, config) => {
  const configuredFields = config?.fields
  const fieldsToRedact =
    Array.isArray(configuredFields) && configuredFields.every((field) => typeof field === 'string')
      ? configuredFields
      : DEFAULT_SENSITIVE_FIELDS

  return redactValue(payload, fieldsToRedact) as Record<string, unknown>
}
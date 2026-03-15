import type { ActionFn } from './index'

// Fields that are redacted by default when no config is provided
const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'creditCard',
  'ssn',
  'apiKey',
]

/**
 * Recursively traverses the payload and replaces sensitive field values
 * with "[REDACTED]". Handles nested objects and arrays.
 *
 * Example:
 *   Input:  { "user": { "name": "Ali", "password": "123" } }
 *   Output: { "user": { "name": "Ali", "password": "[REDACTED]" } }
 */
const redactValue = (
  value: unknown,
  fieldsToRedact: string[]
): unknown => {
  // Recursively process each item in arrays
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, fieldsToRedact))
  }

  // Recursively process nested objects
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

  // Primitive values are returned as-is
  return value
}

// Redacts sensitive fields from the payload before delivery to subscribers.
// The list of fields to redact can be customized via pipeline config:
//   config: { "fields": ["phone", "address"] }
// Falls back to DEFAULT_SENSITIVE_FIELDS if no config is provided.
export const sensitiveFieldRedactionAction: ActionFn = (payload, config) => {
  const configuredFields = config?.fields
  const fieldsToRedact =
    Array.isArray(configuredFields) &&
    configuredFields.every((field) => typeof field === 'string')
      ? configuredFields
      : DEFAULT_SENSITIVE_FIELDS

  return redactValue(payload, fieldsToRedact) as Record<string, unknown>
}
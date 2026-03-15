import type { ActionFn } from './index'

// Maps keywords found in the event type to a mood level.
// This allows automatic categorization of events without manual configuration.
const MOOD_MAP: Record<string, string> = {
  success: 'success',
  completed: 'success',
  created: 'success',
  deployed: 'success',
  failed: 'warning',
  error: 'warning',
  retry: 'warning',
  started: 'info',
  pending: 'info',
  updated: 'info',
}

// Scans the event type string for known keywords to determine its mood.
// Returns 'info' as the default if no keyword matches.
const detectMood = (eventType: string): string => {
  const lower = eventType.toLowerCase()

  for (const [keyword, mood] of Object.entries(MOOD_MAP)) {
    if (lower.includes(keyword)) {
      return mood
    }
  }

  return 'info'
}

// Returns a human-readable message based on the event type and its mood.
// Falls back to a generic message if no specific one is defined.
const generateMessage = (eventType: string, mood: string): string => {
  const messages: Record<string, Record<string, string>> = {
    success: {
      deployment_success: 'Deployment landed safely. No fires detected.',
      order_created: 'New order in the system. Time to deliver.',
      default: `Event '${eventType}' completed successfully.`,
    },
    warning: {
      build_failed: 'Build tripped over its own shoelaces.',
      deployment_failed: 'Houston, we have a problem.',
      default: `Event '${eventType}' needs your attention.`,
    },
    info: {
      default: `Event '${eventType}' is being processed.`,
    },
  }

  return (
    messages[mood]?.[eventType] ??
    messages[mood]?.default ??
    `Event '${eventType}' received.`
  )
}

/**
 * Annotates the payload with mood, tag, and a human-readable message
 * based on the event type. Useful for adding context to events
 * before they reach subscribers.
 *
 * Example:
 *   Input:  { "eventType": "build_failed", "service": "api" }
 *   Output: { "eventType": "build_failed", "service": "api",
 *              "_annotation": { "tag": "system-event", "mood": "warning",
 *                               "message": "Build tripped over its own shoelaces.",
 *                               "annotatedAt": "..." } }
 */
export const eventAnnotationAction: ActionFn = (payload, config) => {
  // Support both "eventType" and "event" field names for flexibility
  const eventType =
    typeof payload.eventType === 'string'
      ? payload.eventType
      : typeof payload.event === 'string'
        ? payload.event
        : 'unknown'

  // Use custom tag from pipeline config, or fall back to default
  const tag =
    typeof config?.defaultTag === 'string'
      ? config.defaultTag
      : 'system-event'

  const mood = detectMood(eventType)
  const message = generateMessage(eventType, mood)

  return {
    ...payload,
    _annotation: {
      tag,
      mood,
      message,
      annotatedAt: new Date().toISOString(),
    },
  }
}
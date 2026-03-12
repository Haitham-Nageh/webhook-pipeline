import type { ActionFn } from './index'

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

const detectMood = (eventType: string): string => {
  const lower = eventType.toLowerCase()

  for (const [keyword, mood] of Object.entries(MOOD_MAP)) {
    if (lower.includes(keyword)) {
      return mood
    }
  }

  return 'info'
}

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

export const eventAnnotationAction: ActionFn = (payload, config) => {
  const eventType =
    typeof payload.eventType === 'string'
      ? payload.eventType
      : typeof payload.event === 'string'
        ? payload.event
        : 'unknown'

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
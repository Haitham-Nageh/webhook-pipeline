import { z } from 'zod'

// Webhook payloads can have any shape since they come from external sources.
// We only enforce that the payload is a JSON object (not an array or primitive).
// The actual payload structure is irrelevant — the processing action handles it.
export const WebhookPayloadSchema = z.record(z.string(), z.unknown())

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>
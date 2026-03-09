import { z } from 'zod'

export const WebhookPayloadSchema = z.record(z.string(), z.unknown())

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>
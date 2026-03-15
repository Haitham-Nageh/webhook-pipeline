import { httpClient } from '../lib/axios'
import { logger } from '../lib/logger'
import { prisma } from '../lib/prisma'

// Maximum number of delivery attempts per subscriber before giving up
const MAX_ATTEMPTS = 4

// Delay in minutes between retries: 1 min → 5 min → 30 min
// This is a simple exponential backoff strategy
const RETRY_DELAYS = [1, 5, 30]

const sleep = (minutes: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, minutes * 60 * 1000))

/*
  Attempts to deliver the processed payload to a single subscriber URL.
  Records the result (success or failure) in the delivery_attempts table.
  Throws on failure so the caller can decide whether to retry.
 */
const deliverToSubscriber = async (
  jobId: string,
  subscriberId: string,
  subscriberUrl: string,
  payload: Record<string, unknown>,
  attemptNumber: number
): Promise<void> => {
  try {
    const response = await httpClient.post(subscriberUrl, payload)

    // Record successful delivery
    await prisma.deliveryAttempt.create({
      data: {
        jobId,
        subscriberId,
        attemptNumber,
        status: 'SUCCESS',
        responseStatus: response.status,
      },
    })

    logger.info(
      { jobId, subscriberId, attemptNumber, status: response.status },
      'Delivery succeeded'
    )
  } catch (err: unknown) {
    // Extract HTTP status code from axios error if available
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined

    const message = err instanceof Error ? err.message : 'Unknown error'

    // Record failed attempt and schedule next retry time
    await prisma.deliveryAttempt.create({
      data: {
        jobId,
        subscriberId,
        attemptNumber,
        status: 'FAILED',
        responseStatus: status ?? null,
        errorMessage: message,
        nextRetryAt:
          attemptNumber < MAX_ATTEMPTS
            ? new Date(Date.now() + RETRY_DELAYS[attemptNumber - 1] * 60 * 1000)
            : null,
      },
    })

    logger.warn(
      { jobId, subscriberId, attemptNumber, status, message },
      'Delivery failed'
    )

    // Re-throw so the retry loop in deliver() can handle it
    throw err
  }
}

/*
  Delivers the processed payload to all subscribers of a job.
  Each subscriber gets up to MAX_ATTEMPTS tries with increasing delays.
  Note: retries are synchronous inside the worker loop for simplicity.
  A future improvement would be scheduling retries asynchronously
  to avoid blocking other pending jobs during the wait period.
  Returns true if all subscribers received the payload, false otherwise.
 */
export const deliver = async (
  jobId: string,
  subscribers: { id: string; targetUrl: string }[],
  payload: Record<string, unknown>
): Promise<boolean> => {
  let allSucceeded = true

  for (const subscriber of subscribers) {
    let attemptNumber = 0
    let delivered = false

    while (attemptNumber < MAX_ATTEMPTS && !delivered) {
      attemptNumber++

      try {
        await deliverToSubscriber(
          jobId,
          subscriber.id,
          subscriber.targetUrl,
          payload,
          attemptNumber
        )
        delivered = true

      } catch {
        if (attemptNumber < MAX_ATTEMPTS) {
          const delayMinutes = RETRY_DELAYS[attemptNumber - 1]

          logger.info(
            { jobId, subscriberId: subscriber.id, attemptNumber, delayMinutes },
            'Retrying delivery'
          )

          await sleep(delayMinutes)
        } else {
          // All attempts exhausted for this subscriber
          allSucceeded = false
          logger.error(
            { jobId, subscriberId: subscriber.id },
            'Max delivery attempts reached'
          )
        }
      }
    }
  }

  return allSucceeded
}
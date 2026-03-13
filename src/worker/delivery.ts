import { httpClient } from '../lib/axios'
import { logger } from '../lib/logger'
import { prisma } from '../lib/prisma'

const MAX_ATTEMPTS = 4
const RETRY_DELAYS = [1, 5, 30] // بالدقائق بين المحاولات الفاشلة

const sleep = (minutes: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, minutes * 60 * 1000))

const deliverToSubscriber = async (
  jobId: string,
  subscriberId: string,
  subscriberUrl: string,
  payload: Record<string, unknown>,
  attemptNumber: number
): Promise<void> => {
  try {
    const response = await httpClient.post(subscriberUrl, payload)

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
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined

    const message = err instanceof Error ? err.message : 'Unknown error'

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

    throw err
  }
}

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
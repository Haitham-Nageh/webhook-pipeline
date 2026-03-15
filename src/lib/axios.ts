import axios from 'axios'
import { logger } from './logger'

// Shared HTTP client used by the delivery layer to send results to subscribers.
// A single instance ensures consistent timeout and headers across all requests.
export const httpClient = axios.create({
  timeout: 5000, // abort requests that take longer than 5 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Log every outgoing request for observability (debug level only)
httpClient.interceptors.request.use((config) => {
  logger.debug({ url: config.url, method: config.method }, 'Outgoing request')
  return config
})

httpClient.interceptors.response.use(
  (response) => {
    logger.debug(
      { url: response.config.url, status: response.status },
      'Request succeeded'
    )
    return response
  },
  (error) => {
    // Log failed requests as warnings — the retry logic will handle them
    logger.warn(
      {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      },
      'Request failed'
    )
    return Promise.reject(error)
  }
)
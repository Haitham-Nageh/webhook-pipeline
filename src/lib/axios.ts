import axios from 'axios'
import { logger } from './logger'

export const httpClient = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
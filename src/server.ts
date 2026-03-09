import app from './app'
import { logger } from './lib/logger'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running')
})
import app from './app'
import { logger } from './lib/logger'
// Fall back to port 3000 if PORT is not set in the environment
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running')
})
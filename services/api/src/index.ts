import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './env.js'
import { eventsRoutes } from './routes/events.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: env.corsOrigin,
})

await app.register(eventsRoutes)

app.get('/health', async () => ({ ok: true, service: 'outbounds-api' }))

try {
  await app.listen({ port: env.port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

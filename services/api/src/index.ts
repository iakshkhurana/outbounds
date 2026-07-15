import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './env.js'
import { eventsRoutes } from './routes/events.js'
import { hostsRoutes } from './routes/hosts.js'
import { overviewRoutes } from './routes/overview.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: env.corsOrigin,
})

await app.register(eventsRoutes)
await app.register(hostsRoutes)
await app.register(overviewRoutes)

app.get('/health', async () => ({ ok: true, service: 'outbounds-api' }))

try {
  await app.listen({ port: env.port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

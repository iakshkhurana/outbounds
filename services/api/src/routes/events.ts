import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { env } from '../env.js'
import { ingestBatchSchema } from '../schemas/event.js'
import { ingestBatch } from '../services/ingest.js'

export async function eventsRoutes(app: FastifyInstance) {
  app.post('/api/events', async (request, reply) => {
    const token = request.headers['x-outbounds-token']
    if (token !== env.snifferToken) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid x-outbounds-token',
        },
      })
    }

    try {
      const body = ingestBatchSchema.parse(request.body)

      if (body.events.length > 500) {
        return reply.code(413).send({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Batch exceeds 500 events',
          },
        })
      }

      const result = await ingestBatch(body)
      return reply.code(202).send(result)
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0]?.message ?? 'Invalid request body',
            details: err.flatten(),
          },
        })
      }
      throw err
    }
  })
}

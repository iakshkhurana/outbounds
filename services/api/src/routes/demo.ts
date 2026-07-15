import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { env } from '../env.js'
import { heartbeatSchema } from '../schemas/event.js'
import { prisma } from '../db.js'
import { replaySampleData, resetDemoData } from '../services/demo.js'

function demoGuard(reply: { code: (status: number) => { send: (body: unknown) => unknown } }) {
  if (!env.allowDemoReplay) {
    return reply.code(403).send({
      error: {
        code: 'DEMO_DISABLED',
        message: 'Demo endpoints require ALLOW_DEMO_REPLAY=true',
      },
    })
  }
  return null
}

export async function demoRoutes(app: FastifyInstance) {
  app.post('/api/demo/replay', async (_request, reply) => {
    const blocked = demoGuard(reply)
    if (blocked) return blocked

    try {
      const result = await replaySampleData()
      return reply.code(202).send({
        mode: 'replay',
        ...result,
      })
    } catch (err) {
      app.log.error(err)
      return reply.code(500).send({
        error: {
          code: 'REPLAY_FAILED',
          message: err instanceof Error ? err.message : 'Replay failed',
        },
      })
    }
  })

  app.post('/api/demo/reset', async (_request, reply) => {
    const blocked = demoGuard(reply)
    if (blocked) return blocked

    await resetDemoData()
    return { ok: true }
  })
}

export async function captureRoutes(app: FastifyInstance) {
  app.post('/api/heartbeat', async (request, reply) => {
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
      const body = heartbeatSchema.parse(request.body)
      const existing = await prisma.captureSession.findUnique({
        where: { id: body.sessionId },
      })

      const session = existing
        ? await prisma.captureSession.update({
            where: { id: body.sessionId },
            data: {
              mode: body.mode,
              source: body.source,
              lastHeartbeatAt: new Date(),
              endedAt: null,
            },
          })
        : await prisma.captureSession.create({
            data: {
              id: body.sessionId,
              mode: body.mode,
              source: body.source,
              lastHeartbeatAt: new Date(),
            },
          })

      return {
        sessionId: session.id,
        mode: session.mode,
        source: session.source,
        lastHeartbeatAt: session.lastHeartbeatAt?.toISOString() ?? null,
      }
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0]?.message ?? 'Invalid heartbeat body',
            details: err.flatten(),
          },
        })
      }
      throw err
    }
  })

  app.get('/api/capture/status', async () => {
    const session = await prisma.captureSession.findFirst({
      orderBy: { lastHeartbeatAt: 'desc' },
    })

    if (!session) {
      return {
        mode: 'idle',
        online: false,
        lastHeartbeatAt: null,
        sessionId: null,
      }
    }

    const last = session.lastHeartbeatAt?.getTime() ?? 0
    const online = Date.now() - last < 15_000

    return {
      mode: session.mode,
      online,
      lastHeartbeatAt: session.lastHeartbeatAt?.toISOString() ?? null,
      sessionId: session.id,
      source: session.source,
    }
  })
}

import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export async function eventFeedRoutes(app: FastifyInstance) {
  app.get('/api/events', async (request) => {
    const query = request.query as {
      hostId?: string
      limit?: string
    }

    const limit = Math.min(Number(query.limit ?? 100) || 100, 500)
    const hostId = query.hostId?.trim()

    const events = await prisma.event.findMany({
      where: hostId ? { hostId } : undefined,
      orderBy: { ts: 'desc' },
      take: limit,
      include: {
        host: {
          select: {
            ip: true,
            hostname: true,
            riskLevel: true,
          },
        },
      },
    })

    return {
      events: events.map((event) => ({
        id: event.id,
        hostId: event.hostId,
        ts: event.ts.toISOString(),
        direction: event.direction,
        protocol: event.protocol,
        srcPort: event.srcPort,
        dstPort: event.dstPort,
        domain: event.domain,
        dnsStatus: event.dnsStatus,
        latencyMs: event.latencyMs,
        processName: event.processName,
        tags: parseJsonArray(event.tags),
        host: {
          ip: event.host.ip,
          hostname: event.host.hostname,
          riskLevel: event.host.riskLevel,
        },
      })),
    }
  })
}

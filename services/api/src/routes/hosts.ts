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

function serializeHost(host: {
  id: string
  ip: string
  hostname: string | null
  firstSeenAt: Date
  lastSeenAt: Date
  bytesOut: number
  bytesIn: number
  eventCount: number
  avgLatencyMs: number | null
  riskLevel: string
  riskReasons: string
}) {
  return {
    id: host.id,
    ip: host.ip,
    hostname: host.hostname,
    firstSeenAt: host.firstSeenAt.toISOString(),
    lastSeenAt: host.lastSeenAt.toISOString(),
    bytesOut: host.bytesOut,
    bytesIn: host.bytesIn,
    eventCount: host.eventCount,
    avgLatencyMs: host.avgLatencyMs,
    riskLevel: host.riskLevel,
    riskReasons: parseJsonArray(host.riskReasons),
  }
}

export async function hostsRoutes(app: FastifyInstance) {
  app.get('/api/hosts', async (request) => {
    const query = request.query as {
      q?: string
      risk?: string
      limit?: string
    }

    const limit = Math.min(Number(query.limit ?? 50) || 50, 200)
    const q = query.q?.trim()
    const risk = query.risk?.trim()

    const hosts = await prisma.host.findMany({
      where: {
        AND: [
          risk ? { riskLevel: risk as 'clean' | 'watch' | 'risky' } : {},
          q
            ? {
                OR: [
                  { ip: { contains: q } },
                  { hostname: { contains: q } },
                ],
              }
            : {},
        ],
      },
      orderBy: { lastSeenAt: 'desc' },
      take: limit,
    })

    return { hosts: hosts.map(serializeHost) }
  })

  app.get('/api/hosts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const host = await prisma.host.findUnique({ where: { id } })
    if (!host) {
      return reply.code(404).send({
        error: { code: 'NOT_FOUND', message: 'Host not found' },
      })
    }

    const recentEvents = await prisma.event.findMany({
      where: { hostId: id },
      orderBy: { ts: 'desc' },
      take: 100,
    })

    return {
      host: serializeHost(host),
      recentEvents: recentEvents.map((event) => ({
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
      })),
    }
  })
}

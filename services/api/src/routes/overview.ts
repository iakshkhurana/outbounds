import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'

export async function overviewRoutes(app: FastifyInstance) {
  app.get('/api/overview', async (request) => {
    const query = request.query as { windowSec?: string }
    const windowSec = Math.min(Math.max(Number(query.windowSec ?? 300) || 300, 30), 86400)
    const since = new Date(Date.now() - windowSec * 1000)

    const events = await prisma.event.findMany({
      where: { ts: { gte: since } },
      select: {
        hostId: true,
        dnsStatus: true,
        latencyMs: true,
      },
    })

    const activeHostIds = new Set(events.map((e) => e.hostId))
    const failedDns = events.filter(
      (e) => e.dnsStatus === 'failed' || e.dnsStatus === 'timeout',
    ).length
    const highLatency = events.filter((e) => e.latencyMs != null && e.latencyMs >= 250).length

    const topHosts = await prisma.host.findMany({
      where: { id: { in: [...activeHostIds] } },
      orderBy: { eventCount: 'desc' },
      take: 10,
    })

    return {
      activeHosts: activeHostIds.size,
      failedDns,
      highLatency,
      eventsInWindow: events.length,
      windowSec,
      topHosts: topHosts.map((host) => ({
        id: host.id,
        label: host.hostname || host.ip,
        eventCount: host.eventCount,
        riskLevel: host.riskLevel,
      })),
    }
  })
}

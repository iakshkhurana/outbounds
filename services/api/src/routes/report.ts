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

function buildMarkdown(input: {
  windowSec: number
  since: Date
  until: Date
  eventsInWindow: number
  failedDns: number
  highLatency: number
  flaggedHosts: Array<{
    label: string
    ip: string
    riskLevel: string
    riskReasons: string[]
    eventCount: number
  }>
}) {
  const lines = [
    '# Outbounds debug report',
    '',
    `- Generated: ${input.until.toISOString()}`,
    `- Window: last ${input.windowSec}s (since ${input.since.toISOString()})`,
    `- Events in window: ${input.eventsInWindow}`,
    `- Failed DNS: ${input.failedDns}`,
    `- High latency (>=250ms): ${input.highLatency}`,
    '',
    '## Flagged hosts',
    '',
  ]

  if (input.flaggedHosts.length === 0) {
    lines.push('_No watch/risky hosts in this window._', '')
  } else {
    for (const host of input.flaggedHosts) {
      lines.push(`### ${host.label} (\`${host.ip}\`)`)
      lines.push(`- Risk: **${host.riskLevel}**`)
      lines.push(`- Events: ${host.eventCount}`)
      if (host.riskReasons.length) {
        lines.push('- Reasons:')
        for (const reason of host.riskReasons) {
          lines.push(`  - ${reason}`)
        }
      }
      lines.push('')
    }
  }

  lines.push('## Notes', '')
  lines.push('- Metadata only. No TLS content inspection.')
  lines.push('- Not a firewall or IDS.')
  lines.push('')

  return lines.join('\n')
}

export async function reportRoutes(app: FastifyInstance) {
  app.get('/api/report', async (request, reply) => {
    const query = request.query as { windowSec?: string; format?: string }
    const windowSec = Math.min(Math.max(Number(query.windowSec ?? 300) || 300, 30), 86400)
    const format = (query.format ?? 'markdown').toLowerCase()
    const until = new Date()
    const since = new Date(until.getTime() - windowSec * 1000)

    const events = await prisma.event.findMany({
      where: { ts: { gte: since, lte: until } },
      select: {
        hostId: true,
        dnsStatus: true,
        latencyMs: true,
      },
    })

    const activeHostIds = [...new Set(events.map((e) => e.hostId))]
    const failedDns = events.filter(
      (e) => e.dnsStatus === 'failed' || e.dnsStatus === 'timeout',
    ).length
    const highLatency = events.filter((e) => e.latencyMs != null && e.latencyMs >= 250).length

    const flaggedHosts = await prisma.host.findMany({
      where: {
        id: { in: activeHostIds },
        riskLevel: { in: ['watch', 'risky'] },
      },
      orderBy: [{ riskLevel: 'desc' }, { eventCount: 'desc' }],
    })

    const payload = {
      windowSec,
      since,
      until,
      eventsInWindow: events.length,
      failedDns,
      highLatency,
      flaggedHosts: flaggedHosts.map((host) => ({
        id: host.id,
        label: host.hostname || host.ip,
        ip: host.ip,
        riskLevel: host.riskLevel,
        riskReasons: parseJsonArray(host.riskReasons),
        eventCount: host.eventCount,
      })),
    }

    if (format === 'json') {
      return {
        generatedAt: until.toISOString(),
        windowSec: payload.windowSec,
        since: since.toISOString(),
        until: until.toISOString(),
        summary: {
          eventsInWindow: payload.eventsInWindow,
          failedDns: payload.failedDns,
          highLatency: payload.highLatency,
          flaggedHostCount: payload.flaggedHosts.length,
        },
        flaggedHosts: payload.flaggedHosts,
      }
    }

    const markdown = buildMarkdown(payload)
    return reply.type('text/markdown; charset=utf-8').send(markdown)
  })
}

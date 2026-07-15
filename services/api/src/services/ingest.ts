import { prisma } from '../db.js'
import { assessEvent, mergeHostRisk, type RiskLevel } from '../risk/engine.js'
import type { EventInput, IngestBatch } from '../schemas/event.js'

function parseReasons(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

async function findHost(ip: string, hostname: string | null | undefined) {
  if (hostname) {
    return prisma.host.findFirst({ where: { ip, hostname } })
  }
  return prisma.host.findFirst({ where: { ip, hostname: null } })
}

export async function ingestBatch(batch: IngestBatch): Promise<{
  accepted: number
  hostsTouched: number
}> {
  const touched = new Set<string>()
  let accepted = 0

  // Burst count per host key inside this batch (novelty signal)
  const burstCounts = new Map<string, number>()
  for (const event of batch.events) {
    const key = `${event.ip}|${event.hostname ?? ''}`
    burstCounts.set(key, (burstCounts.get(key) ?? 0) + 1)
  }

  for (const event of batch.events) {
    await persistEvent(event, burstCounts.get(`${event.ip}|${event.hostname ?? ''}`) ?? 1)
    touched.add(`${event.ip}|${event.hostname ?? ''}`)
    accepted += 1
  }

  return { accepted, hostsTouched: touched.size }
}

async function persistEvent(event: EventInput, burstCount: number) {
  const ts = new Date(event.ts)
  const assessment = assessEvent(event, { burstCount })
  const existing = await findHost(event.ip, event.hostname)

  let hostId: string

  if (!existing) {
    const created = await prisma.host.create({
      data: {
        ip: event.ip,
        hostname: event.hostname ?? null,
        firstSeenAt: ts,
        lastSeenAt: ts,
        bytesOut: event.bytesOut ?? 0,
        bytesIn: event.bytesIn ?? 0,
        eventCount: 1,
        avgLatencyMs: event.latencyMs ?? null,
        riskLevel: assessment.riskLevel,
        riskReasons: JSON.stringify(assessment.riskReasons),
      },
    })
    hostId = created.id
  } else {
    const nextCount = existing.eventCount + 1
    const mergedRisk = mergeHostRisk(
      existing.riskLevel as RiskLevel,
      parseReasons(existing.riskReasons),
      assessment,
    )

    const avgLatencyMs =
      event.latencyMs == null
        ? existing.avgLatencyMs
        : existing.avgLatencyMs == null
          ? event.latencyMs
          : (existing.avgLatencyMs * existing.eventCount + event.latencyMs) / nextCount

    const updated = await prisma.host.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: ts > existing.lastSeenAt ? ts : existing.lastSeenAt,
        bytesOut: existing.bytesOut + (event.bytesOut ?? 0),
        bytesIn: existing.bytesIn + (event.bytesIn ?? 0),
        eventCount: nextCount,
        avgLatencyMs,
        riskLevel: mergedRisk.riskLevel,
        riskReasons: JSON.stringify(mergedRisk.riskReasons),
      },
    })
    hostId = updated.id
  }

  await prisma.event.create({
    data: {
      hostId,
      ts,
      direction: event.direction ?? 'out',
      protocol: event.protocol,
      srcPort: event.srcPort ?? null,
      dstPort: event.dstPort ?? null,
      domain: event.domain ?? null,
      dnsStatus: event.dnsStatus ?? 'unknown',
      latencyMs: event.latencyMs ?? null,
      processName: event.processName ?? null,
      tags: JSON.stringify(assessment.tags),
    },
  })
}

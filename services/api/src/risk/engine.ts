import type { EventInput } from '../schemas/event.js'

export type RiskLevel = 'clean' | 'watch' | 'risky'

const COMMON_PORTS = new Set([80, 443, 53, 123, 22, 8080, 8443])
const HIGH_LATENCY_MS = 250

export type RiskAssessment = {
  riskLevel: RiskLevel
  riskReasons: string[]
  tags: string[]
}

export function assessEvent(event: EventInput, opts?: { burstCount?: number }): RiskAssessment {
  const reasons = new Set<string>()
  const tags = new Set<string>(event.tags ?? [])
  let level: RiskLevel = 'clean'

  const dnsBad = event.dnsStatus === 'failed' || event.dnsStatus === 'timeout'
  if (dnsBad) {
    reasons.add(`DNS ${event.dnsStatus}${event.domain ? ` for ${event.domain}` : ''}`)
    level = bump(level, 'watch')
  }

  if (event.latencyMs != null && event.latencyMs >= HIGH_LATENCY_MS) {
    reasons.add(`High latency (${Math.round(event.latencyMs)}ms)`)
    tags.add('high_latency')
    level = bump(level, 'watch')
  }

  if (event.dstPort != null && !COMMON_PORTS.has(event.dstPort)) {
    reasons.add(`Unusual destination port ${event.dstPort}`)
    tags.add('unusual_port')
    level = bump(level, 'watch')
  }

  const burst = opts?.burstCount ?? 0
  if (burst >= 8) {
    reasons.add(`Burst novelty (${burst} events in short window)`)
    tags.add('burst')
    level = bump(level, 'watch')
  }

  if (dnsBad && burst >= 3) {
    reasons.add('Repeated DNS failures')
    level = bump(level, 'risky')
  }

  return {
    riskLevel: level,
    riskReasons: [...reasons],
    tags: [...tags],
  }
}

export function mergeHostRisk(
  currentLevel: RiskLevel,
  currentReasons: string[],
  next: RiskAssessment,
): { riskLevel: RiskLevel; riskReasons: string[] } {
  const reasons = [...new Set([...currentReasons, ...next.riskReasons])]
  return {
    riskLevel: bump(currentLevel, next.riskLevel),
    riskReasons: reasons.slice(0, 12),
  }
}

function bump(current: RiskLevel, next: RiskLevel): RiskLevel {
  const rank = { clean: 0, watch: 1, risky: 2 } as const
  return rank[next] > rank[current] ? next : current
}

import type { Host, NetworkEvent, OverviewStats, RiskLevel } from './types'

type ApiHost = {
  id: string
  ip: string
  hostname: string | null
  firstSeenAt?: string
  lastSeenAt: string
  bytesOut?: number
  bytesIn?: number
  eventCount: number
  avgLatencyMs?: number | null
  riskLevel: RiskLevel
  riskReasons: string[]
}

type ApiEvent = {
  id: string
  hostId: string
  ts: string
  direction: 'out' | 'in' | 'unknown'
  protocol: 'tcp' | 'udp' | 'dns' | 'other'
  srcPort: number | null
  dstPort: number | null
  domain: string | null
  dnsStatus: 'ok' | 'failed' | 'timeout' | 'unknown'
  latencyMs: number | null
  processName: string | null
  tags: string[]
  host?: {
    ip: string
    hostname: string | null
    riskLevel: RiskLevel
  }
}

export function mapApiHost(host: ApiHost): Host {
  return {
    id: host.id,
    ip: host.ip,
    hostname: host.hostname || host.ip,
    region:
      host.avgLatencyMs != null ? `${Math.round(host.avgLatencyMs)}ms avg` : '—',
    lastSeen: new Date(host.lastSeenAt),
    totalEvents: host.eventCount,
    riskLevel: host.riskLevel,
    riskReasons: host.riskReasons ?? [],
  }
}

export function mapApiEvent(event: ApiEvent): NetworkEvent {
  const status =
    event.dnsStatus === 'failed'
      ? 'failed'
      : event.dnsStatus === 'timeout'
        ? 'timeout'
        : 'success'

  return {
    id: event.id,
    timestamp: new Date(event.ts),
    hostId: event.hostId,
    direction: event.direction === 'in' ? 'inbound' : 'outbound',
    protocol: event.protocol,
    sourceIp: 'local',
    sourcePort: event.srcPort ?? 0,
    destinationIp: event.host?.ip ?? 'unknown',
    destinationPort: event.dstPort ?? 0,
    destinationHostname: event.host?.hostname || event.domain || undefined,
    dataTransferred: 0,
    latency: event.latencyMs ?? 0,
    status,
    riskLevel: event.host?.riskLevel ?? 'clean',
    reason: event.domain ?? undefined,
  }
}

export function mapOverview(raw: {
  activeHosts: number
  failedDns: number
  highLatency: number
  eventsInWindow: number
  windowSec?: number
}): OverviewStats {
  return {
    activeHosts: raw.activeHosts,
    failedDns: raw.failedDns,
    highLatency: raw.highLatency,
    eventsInWindow: raw.eventsInWindow,
    windowSec: raw.windowSec ?? 300,
  }
}

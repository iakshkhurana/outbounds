import type {
  CaptureStatus,
  FilterState,
  Host,
  NetworkEvent,
  OverviewStats,
  Report,
} from './types'
import {
  filterEvents,
  getAllEvents,
  getAllHosts,
  getEventsByHostId,
  getHostById,
  getNetworkStats,
} from './mock'
import { mapApiEvent, mapApiHost, mapOverview } from './mappers'

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''

export type DataSource = 'api' | 'mock' | 'unreachable'

let lastDataSource: DataSource = API_URL ? 'unreachable' : 'mock'

export function getLastDataSource() {
  return lastDataSource
}

async function tryApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  if (!API_URL) {
    lastDataSource = 'mock'
    return null
  }
  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
    if (!res.ok) {
      lastDataSource = 'unreachable'
      return null
    }
    lastDataSource = 'api'
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return (await res.json()) as T
    }
    return (await res.text()) as T
  } catch {
    lastDataSource = 'unreachable'
    return null
  }
}

export async function probeApi(): Promise<DataSource> {
  if (!API_URL) {
    lastDataSource = 'mock'
    return lastDataSource
  }
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' })
    lastDataSource = res.ok ? 'api' : 'unreachable'
  } catch {
    lastDataSource = 'unreachable'
  }
  return lastDataSource
}

export function isApiConfigured() {
  return Boolean(API_URL)
}

export async function fetchHosts(): Promise<Host[]> {
  const remote = await tryApi<{ hosts: Parameters<typeof mapApiHost>[0][] }>('/api/hosts')
  if (remote?.hosts) return remote.hosts.map(mapApiHost)
  return getAllHosts()
}

export async function fetchHostById(id: string): Promise<Host | null> {
  const remote = await tryApi<{
    host: Parameters<typeof mapApiHost>[0]
    recentEvents: Parameters<typeof mapApiEvent>[0][]
  }>(`/api/hosts/${encodeURIComponent(id)}`)
  if (remote?.host) return mapApiHost(remote.host)
  return getHostById(id) || null
}

export async function fetchEvents(filters?: FilterState): Promise<NetworkEvent[]> {
  const remote = await tryApi<{ events: Parameters<typeof mapApiEvent>[0][] }>('/api/events')
  let events = remote?.events ? remote.events.map(mapApiEvent) : getAllEvents()

  if (filters) {
    events = filterEvents(events, {
      riskLevel: filters.riskLevel,
      protocol: filters.protocol,
      status: filters.status,
    })
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export async function fetchEventsByHost(hostId: string): Promise<NetworkEvent[]> {
  const remote = await tryApi<{ events: Parameters<typeof mapApiEvent>[0][] }>(
    `/api/events?hostId=${encodeURIComponent(hostId)}`,
  )
  const events = remote?.events
    ? remote.events.map(mapApiEvent)
    : getEventsByHostId(hostId)
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export async function fetchNetworkStats(): Promise<OverviewStats> {
  const remote = await tryApi<{
    activeHosts: number
    failedDns: number
    highLatency: number
    eventsInWindow: number
    windowSec?: number
  }>('/api/overview?windowSec=300')

  if (remote) return mapOverview(remote)

  const legacy = getNetworkStats()
  return {
    activeHosts: legacy.uniqueHosts,
    failedDns: legacy.failedEvents,
    highLatency: 0,
    eventsInWindow: legacy.totalEvents,
    windowSec: 300,
  }
}

export async function fetchCaptureStatus(): Promise<CaptureStatus> {
  const remote = await tryApi<CaptureStatus>('/api/capture/status')
  if (remote) return remote
  return {
    mode: 'idle',
    online: false,
    lastHeartbeatAt: null,
    sessionId: null,
  }
}

export async function triggerReplay(): Promise<boolean> {
  const remote = await tryApi<{ accepted?: number }>('/api/demo/replay', {
    method: 'POST',
    body: '{}',
  })
  return Boolean(remote)
}

export async function triggerReset(): Promise<boolean> {
  const remote = await tryApi<{ ok?: boolean }>('/api/demo/reset', {
    method: 'POST',
    body: '{}',
  })
  return Boolean(remote?.ok)
}

export async function generateReport(startTime: Date, endTime: Date): Promise<Report> {
  const remoteMarkdown = await tryApi<string>(
    `/api/report?windowSec=${Math.max(
      30,
      Math.round((endTime.getTime() - startTime.getTime()) / 1000),
    )}&format=json`,
  )

  if (remoteMarkdown && typeof remoteMarkdown === 'object') {
    const remote = remoteMarkdown as {
      generatedAt: string
      since: string
      until: string
      summary: {
        eventsInWindow: number
        failedDns: number
        highLatency: number
        flaggedHostCount: number
      }
      flaggedHosts: Array<{
        id: string
        label: string
        ip: string
        riskLevel: Host['riskLevel']
        riskReasons: string[]
        eventCount: number
      }>
    }

    return {
      generatedAt: new Date(remote.generatedAt),
      period: { start: new Date(remote.since), end: new Date(remote.until) },
      summary: {
        totalEvents: remote.summary.eventsInWindow,
        uniqueHosts: remote.summary.flaggedHostCount,
        avgLatency: 0,
        riskDistribution: {
          clean: 0,
          watch: remote.flaggedHosts.filter((h) => h.riskLevel === 'watch').length,
          risky: remote.flaggedHosts.filter((h) => h.riskLevel === 'risky').length,
        },
      },
      hosts: remote.flaggedHosts.map((h) => ({
        id: h.id,
        ip: h.ip,
        hostname: h.label,
        region: '—',
        lastSeen: new Date(remote.until),
        totalEvents: h.eventCount,
        riskLevel: h.riskLevel,
        riskReasons: h.riskReasons,
      })),
      events: [],
    }
  }

  const events = getAllEvents().filter(
    (e) => e.timestamp >= startTime && e.timestamp <= endTime,
  )
  const hosts = getAllHosts()

  return {
    generatedAt: new Date(),
    period: { start: startTime, end: endTime },
    summary: {
      totalEvents: events.length,
      uniqueHosts: new Set(events.map((e) => e.hostId)).size,
      avgLatency: Math.round(
        events.reduce((sum, e) => sum + e.latency, 0) / (events.length || 1),
      ),
      riskDistribution: {
        clean: events.filter((e) => e.riskLevel === 'clean').length,
        watch: events.filter((e) => e.riskLevel === 'watch').length,
        risky: events.filter((e) => e.riskLevel === 'risky').length,
      },
    },
    hosts,
    events,
  }
}

import type { FilterState, Host, NetworkEvent, Report } from './types'
import {
  filterEvents,
  getAllEvents,
  getAllHosts,
  getEventsByHostId,
  getHostById,
  getNetworkStats,
} from './mock'

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''

async function tryApi<T>(path: string): Promise<T | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function fetchHosts(): Promise<Host[]> {
  const remote = await tryApi<Host[]>('/api/hosts')
  if (remote) return remote
  return getAllHosts()
}

export async function fetchHostById(id: string): Promise<Host | null> {
  const remote = await tryApi<Host>(`/api/hosts/${encodeURIComponent(id)}`)
  if (remote) return remote
  return getHostById(id) || null
}

export async function fetchEvents(filters?: FilterState): Promise<NetworkEvent[]> {
  const remote = await tryApi<NetworkEvent[]>('/api/events')
  let events = remote ?? getAllEvents()

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
  const remote = await tryApi<NetworkEvent[]>(
    `/api/events?hostId=${encodeURIComponent(hostId)}`,
  )
  const events = remote ?? getEventsByHostId(hostId)
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export async function fetchNetworkStats() {
  const remote = await tryApi<ReturnType<typeof getNetworkStats>>('/api/overview')
  if (remote) return remote
  return getNetworkStats()
}

export async function generateReport(startTime: Date, endTime: Date): Promise<Report> {
  const events = getAllEvents().filter(
    (e) => e.timestamp >= startTime && e.timestamp <= endTime,
  )
  const hosts = getAllHosts()

  return {
    generatedAt: new Date(),
    period: {
      start: startTime,
      end: endTime,
    },
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

export async function searchEvents(query: string): Promise<NetworkEvent[]> {
  const lowerQuery = query.toLowerCase()
  const events = getAllEvents().filter(
    (e) =>
      e.destinationHostname?.toLowerCase().includes(lowerQuery) ||
      e.destinationIp.includes(query) ||
      e.sourceIp.includes(query),
  )

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

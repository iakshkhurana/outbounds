'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { MetricsGrid } from '@/components/overview/metrics-grid'
import { FilterBar } from '@/components/overview/filter-bar'
import { EventFeed } from '@/components/shared/event-feed'
import { RiskChip } from '@/components/shared/risk-chip'
import { useTone } from '@/components/providers/tone-provider'
import type { FilterState, Host, NetworkEvent } from '@/lib/types'
import { fetchEvents, fetchHosts, isApiConfigured, triggerReplay } from '@/lib/api'

export function OverviewPage() {
  const { tone } = useTone()
  const [events, setEvents] = useState<NetworkEvent[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [filters, setFilters] = useState<FilterState>({})
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchEvents(filters), fetchHosts()]).then(([eventsData, hostsData]) => {
      if (cancelled) return
      setEvents(eventsData)
      setHosts(hostsData)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [filters, refreshKey])

  const filteredEvents = events.filter((event) => {
    if (!filters.searchTerm) return true
    const term = filters.searchTerm.toLowerCase()
    return (
      event.destinationHostname?.toLowerCase().includes(term) ||
      event.destinationIp.includes(filters.searchTerm) ||
      event.sourceIp.includes(filters.searchTerm)
    )
  })

  const riskCount = (level: NetworkEvent['riskLevel']) =>
    events.filter((e) => e.riskLevel === level).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onDataMutated={reload} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <MetricsGrid refreshKey={refreshKey} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              {
                level: 'clean' as const,
                label: 'Clean',
                valueClass: 'text-emerald-400',
                barClass: 'bg-emerald-500',
              },
              {
                level: 'watch' as const,
                label: 'Watch',
                valueClass: 'text-amber-400',
                barClass: 'bg-amber-500',
              },
              {
                level: 'risky' as const,
                label: 'Risky',
                valueClass: 'text-red-400',
                barClass: 'bg-red-500',
              },
            ] as const
          ).map(({ level, label, valueClass, barClass }) => {
            const count = riskCount(level)
            const pct = events.length ? (count / events.length) * 100 : 0
            return (
              <div
                key={level}
                className="rounded-lg border border-border/40 bg-card/40 p-6 backdrop-blur-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className={`text-3xl font-bold ${valueClass}`}>{count}</div>
                  <div className="text-xs text-muted-foreground">events</div>
                </div>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mb-6">
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live feed</h2>
            <span className="text-xs text-muted-foreground">
              {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}
            </span>
          </div>

          {!loading && filteredEvents.length === 0 && isApiConfigured() ? (
            <div className="rounded-lg border border-border/30 bg-card/30 p-8 text-center">
              <p className="text-muted-foreground">No events in the API yet.</p>
              <button
                type="button"
                className="mt-4 rounded border border-primary/40 px-4 py-2 text-sm text-primary hover:bg-primary/10"
                onClick={async () => {
                  const ok = await triggerReplay()
                  if (ok) reload()
                }}
              >
                Load sample replay
              </button>
            </div>
          ) : (
            <EventFeed events={filteredEvents} tone={tone} loading={loading} />
          )}
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Active hosts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hosts.slice(0, 6).map((host) => (
              <Link
                key={host.id}
                href={`/hosts/${host.id}`}
                className="group block rounded-lg border border-border/40 bg-card/40 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/60"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-semibold">{host.ip}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {host.hostname}
                      </div>
                    </div>
                    <RiskChip level={host.riskLevel} tone={tone} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{host.totalEvents} events</span>
                    <span>{host.region}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <footer className="mt-16 border-t border-border/20 pt-8 text-center text-xs text-muted-foreground">
          <p>Metadata only · Not a firewall · Local lab tool</p>
          <p className="mt-2">
            <Link href="/report" className="text-primary hover:underline">
              Export report
            </Link>
          </p>
        </footer>
      </main>
    </div>
  )
}

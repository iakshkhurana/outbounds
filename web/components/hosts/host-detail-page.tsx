'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { EventFeed } from '@/components/shared/event-feed'
import { RiskChip } from '@/components/shared/risk-chip'
import { useTone } from '@/components/providers/tone-provider'
import type { Host, NetworkEvent } from '@/lib/types'
import { fetchEventsByHost, fetchHostById } from '@/lib/api'

interface HostDetailPageProps {
  hostId: string
}

export function HostDetailPage({ hostId }: HostDetailPageProps) {
  const { tone } = useTone()
  const [host, setHost] = useState<Host | null>(null)
  const [events, setEvents] = useState<NetworkEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchHostById(hostId), fetchEventsByHost(hostId)]).then(
      ([hostData, eventsData]) => {
        if (cancelled) return
        setHost(hostData)
        setEvents(eventsData)
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [hostId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="h-10 w-48 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
          </div>
        </main>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border/30 bg-card/30 p-8 text-center">
            <h2 className="text-xl font-semibold">Host not found</h2>
            <p className="mt-2 text-muted-foreground">
              This host is not in the current capture window.
            </p>
            <Link href="/" className="mt-4 inline-block text-primary hover:underline">
              Back to overview
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const avgLatency =
    events.length > 0
      ? Math.round(events.reduce((sum, e) => sum + e.latency, 0) / events.length)
      : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back to overview
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{host.hostname}</h1>
            <p className="mt-1 font-mono text-muted-foreground">{host.ip}</p>
          </div>
          <RiskChip level={host.riskLevel} tone={tone} />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/40 bg-card/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Region
            </div>
            <div className="mt-2 text-lg font-semibold">{host.region}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total events
            </div>
            <div className="mt-2 text-lg font-semibold">{host.totalEvents}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last seen
            </div>
            <div className="mt-2 text-lg font-semibold">
              {host.lastSeen.toLocaleTimeString()}
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In window
            </div>
            <div className="mt-2 text-lg font-semibold">{events.length}</div>
          </div>
        </div>

        {host.riskReasons.length > 0 && (
          <div className="mb-8 rounded-lg border border-border/40 bg-card/40 p-6">
            <h2 className="mb-4 text-lg font-semibold">Risk reasons</h2>
            <ul className="space-y-2">
              {host.riskReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Network events</h2>
            <span className="text-xs text-muted-foreground">
              {events.length} event{events.length === 1 ? '' : 's'}
            </span>
          </div>
          <EventFeed events={events} tone={tone} />
        </div>

        {events.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border/40 bg-card/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Protocols
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(events.map((e) => e.protocol))).map((proto) => (
                  <span
                    key={proto}
                    className="inline-block rounded bg-primary/20 px-2 py-1 font-mono text-xs font-semibold text-primary"
                  >
                    {proto.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-card/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success</span>
                  <span className="font-semibold text-emerald-400">
                    {events.filter((e) => e.status === 'success').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="font-semibold text-red-400">
                    {events.filter((e) => e.status === 'failed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeout</span>
                  <span className="font-semibold text-amber-400">
                    {events.filter((e) => e.status === 'timeout').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-card/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average latency
              </div>
              <div className="mt-3 text-2xl font-bold text-primary">
                {avgLatency}
                <span className="text-sm text-muted-foreground"> ms</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { fetchNetworkStats } from '@/lib/api'
import type { OverviewStats } from '@/lib/types'

export function MetricsGrid({ refreshKey = 0 }: { refreshKey?: number }) {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchNetworkStats().then((data) => {
      if (cancelled) return
      setStats(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4">
            <div className="mb-2 h-8 w-20 rounded bg-muted" />
            <div className="h-6 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      label: 'Active hosts',
      value: stats?.activeHosts ?? 0,
      detail: `last ${stats?.windowSec ?? 300}s`,
    },
    {
      label: 'Events',
      value: stats?.eventsInWindow ?? 0,
      detail: 'in window',
    },
    {
      label: 'Failed DNS',
      value: stats?.failedDns ?? 0,
      detail: 'failed / timeout',
    },
    {
      label: 'High latency',
      value: stats?.highLatency ?? 0,
      detail: '≥ 250ms',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-colors hover:border-primary/30"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </div>
          <div className="mt-2 text-2xl font-bold text-primary">{metric.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{metric.detail}</div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { fetchNetworkStats } from '@/lib/api'

export function MetricsGrid() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNetworkStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
            <div className="h-8 w-20 rounded bg-muted mb-2"></div>
            <div className="h-6 w-24 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Events',
      value: stats?.totalEvents || 0,
      detail: 'in last 24h',
    },
    {
      label: 'Unique Hosts',
      value: stats?.uniqueHosts || 0,
      detail: 'active',
    },
    {
      label: 'Avg Latency',
      value: `${stats?.avgLatency || 0}ms`,
      detail: 'network delay',
    },
    {
      label: 'Failed Events',
      value: stats?.failedEvents || 0,
      detail: 'errors detected',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm hover:border-primary/30 transition-colors"
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {metric.label}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-primary">{metric.value}</div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{metric.detail}</div>
        </div>
      ))}
    </div>
  )
}

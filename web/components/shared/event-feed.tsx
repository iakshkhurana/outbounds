'use client'

import Link from 'next/link'
import { NetworkEvent, Tone } from '@/lib/types'
import { RiskChip } from './risk-chip'

interface EventFeedProps {
  events: NetworkEvent[]
  tone: Tone
  loading?: boolean
}

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

function getStatusColor(status: string) {
  switch (status) {
    case 'success':
      return 'text-emerald-400'
    case 'failed':
      return 'text-red-400'
    case 'timeout':
      return 'text-amber-400'
    default:
      return 'text-muted-foreground'
  }
}

function getProtocolColor(protocol: string) {
  switch (protocol) {
    case 'https':
      return 'text-emerald-400'
    case 'http':
      return 'text-amber-400'
    case 'dns':
      return 'text-blue-400'
    case 'tcp':
      return 'text-purple-400'
    case 'udp':
      return 'text-pink-400'
    default:
      return 'text-foreground'
  }
}

export function EventFeed({ events, tone, loading = false }: EventFeedProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border/30 bg-card/30 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-muted"></div>
                <div className="h-3 w-64 rounded bg-muted"></div>
              </div>
              <div className="h-6 w-16 rounded bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/40 bg-card/20 p-10 text-center">
        <p className="text-sm font-medium text-foreground">No events to show</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Clear filters, load a sample replay, or start the sniffer dry-run.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/hosts/${event.hostId}`}
          className="group block animate-in fade-in rounded-lg border border-border/40 bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-mono text-xs font-semibold ${getProtocolColor(event.protocol)}`}>
                  {event.protocol.toUpperCase()}
                </span>
                <span className="truncate text-sm font-medium">
                  {event.destinationHostname || event.destinationIp}
                </span>
                {event.destinationPort > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">
                    :{event.destinationPort}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{event.destinationIp}</span>
                {event.reason && (
                  <>
                    <span>•</span>
                    <span className="truncate">{event.reason}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/75">
                <span>{formatTime(event.timestamp)}</span>
                <span>•</span>
                <span>{event.latency}ms</span>
                {event.dataTransferred > 0 && (
                  <>
                    <span>•</span>
                    <span>{(event.dataTransferred / 1024).toFixed(1)}KB</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="text-right">
                <div className={`font-mono text-xs font-semibold ${getStatusColor(event.status)}`}>
                  {event.status.toUpperCase()}
                </div>
                <RiskChip level={event.riskLevel} tone={tone} className="mt-1" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

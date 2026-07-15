'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTone } from '@/components/providers/tone-provider'
import {
  fetchCaptureStatus,
  isApiConfigured,
  triggerReplay,
  triggerReset,
} from '@/lib/api'
import type { CaptureStatus } from '@/lib/types'

export function Header({ onDataMutated }: { onDataMutated?: () => void }) {
  const { tone, setTone } = useTone()
  const [status, setStatus] = useState<CaptureStatus | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshStatus = useCallback(() => {
    fetchCaptureStatus().then(setStatus)
  }, [])

  useEffect(() => {
    refreshStatus()
    const id = setInterval(refreshStatus, 3000)
    return () => clearInterval(id)
  }, [refreshStatus])

  const label =
    !isApiConfigured()
      ? 'Mock'
      : status?.online
        ? status.mode === 'replay'
          ? 'Replay'
          : 'Live'
        : status?.mode === 'replay'
          ? 'Replay'
          : 'Offline'

  const dotClass =
    label === 'Offline'
      ? 'bg-muted-foreground'
      : label === 'Mock'
        ? 'bg-amber-400'
        : 'bg-primary animate-pulse'

  const handleReplay = async () => {
    setBusy(true)
    const ok = await triggerReplay()
    setBusy(false)
    if (ok) {
      refreshStatus()
      onDataMutated?.()
    }
  }

  const handleReset = async () => {
    setBusy(true)
    const ok = await triggerReset()
    setBusy(false)
    if (ok) {
      refreshStatus()
      onDataMutated?.()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-foreground">
              <span className="font-mono text-xs font-bold tracking-wide">OUT</span>
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-tight">Outbounds</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                See who your device is really talking to
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {isApiConfigured() && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleReplay}
                  className="rounded border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary/50 disabled:opacity-50"
                >
                  Replay sample
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleReset}
                  className="rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Reset
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 rounded border border-border bg-card/50 p-1">
              <button
                type="button"
                onClick={() => setTone('serious')}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  tone === 'serious'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Serious
              </button>
              <button
                type="button"
                onClick={() => setTone('story')}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  tone === 'story'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Story
              </button>
            </div>

            <div className="flex flex-col items-end gap-1 border-l border-border/40 pl-4">
              <div className="text-xs text-muted-foreground">Capture</div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dotClass}`} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

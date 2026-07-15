'use client'

import { isApiConfigured } from '@/lib/api'

type ApiBannerProps = {
  source: 'api' | 'mock' | 'unreachable'
  onRetry?: () => void
}

export function ApiBanner({ source, onRetry }: ApiBannerProps) {
  if (!isApiConfigured()) {
    return (
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        API URL not set. Showing local mock data. Add{' '}
        <span className="font-mono">NEXT_PUBLIC_API_URL</span> in{' '}
        <span className="font-mono">web/.env.local</span>.
      </div>
    )
  }

  if (source === 'unreachable') {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        <span>
          API at <span className="font-mono">NEXT_PUBLIC_API_URL</span> is unreachable.
          Start <span className="font-mono">services/api</span> on :4000, then retry.
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded border border-red-400/40 px-3 py-1 text-xs hover:bg-red-500/20"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (source === 'mock') {
    return (
      <div className="mb-6 rounded-lg border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
        Connected path fell back to mock data. Use Replay sample once the API is healthy.
      </div>
    )
  }

  return null
}

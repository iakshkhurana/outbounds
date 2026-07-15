'use client'

import Link from 'next/link'
import { useTone } from '@/components/providers/tone-provider'

export function Header() {
  const { tone, setTone } = useTone()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-4">
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

            <div className="hidden flex-col items-end gap-1 border-l border-border/40 pl-4 sm:flex">
              <div className="text-xs text-muted-foreground">Capture</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Replay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

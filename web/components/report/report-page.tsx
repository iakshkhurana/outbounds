'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import type { Report } from '@/lib/types'
import { fetchDebugReport } from '@/lib/api'

const PERIOD_TO_WINDOW: Record<'day' | 'week' | 'month', number> = {
  day: 86400,
  week: 604800,
  month: 2592000,
}

export function ReportPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  const handleGenerateReport = async () => {
    setLoading(true)
    const bundle = await fetchDebugReport(PERIOD_TO_WINDOW[period])
    setReport(bundle.json)
    setMarkdown(bundle.markdown)
    setLoading(false)
  }

  const downloadAsMarkdown = () => {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outbounds-report-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsJSON = () => {
    if (!report) return
    const json = JSON.stringify(report, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outbounds-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to overview
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Export report</h1>
          <p className="mt-2 text-muted-foreground">
            Pull a Markdown/JSON debug report from the API for the selected window
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-border/40 bg-card/40 p-6">
          <h2 className="mb-4 text-lg font-semibold">Report settings</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Time window</div>
              <div className="flex flex-wrap gap-3">
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border/50 bg-card/50 text-foreground hover:border-primary/50'
                    }`}
                  >
                    Last {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Generate report'}
            </button>
          </div>
        </div>

        {report && markdown && (
          <>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={downloadAsMarkdown}
                className="flex-1 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                Download Markdown
              </button>
              <button
                type="button"
                onClick={downloadAsJSON}
                className="flex-1 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                Download JSON
              </button>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/40 bg-card/40 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Events</div>
                <div className="mt-2 text-2xl font-bold text-primary">
                  {report.summary.totalEvents}
                </div>
              </div>
              <div className="rounded-lg border border-border/40 bg-card/40 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Flagged hosts
                </div>
                <div className="mt-2 text-2xl font-bold text-primary">
                  {report.summary.uniqueHosts}
                </div>
              </div>
              <div className="rounded-lg border border-border/40 bg-card/40 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Risky</div>
                <div className="mt-2 text-2xl font-bold text-red-400">
                  {report.summary.riskDistribution.risky}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-card/40 p-6">
              <h2 className="mb-4 text-lg font-semibold">Markdown preview</h2>
              <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                {markdown}
              </pre>
            </div>
          </>
        )}

        {!report && !loading && (
          <div className="rounded-lg border border-dashed border-border/40 bg-card/20 p-8 text-center text-sm text-muted-foreground">
            Generate a report to preview API Markdown output here.
          </div>
        )}
      </main>
    </div>
  )
}

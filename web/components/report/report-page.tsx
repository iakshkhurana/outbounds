'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import type { Report } from '@/lib/types'
import { generateReport } from '@/lib/api'

export function ReportPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  const handleGenerateReport = async () => {
    setLoading(true)
    const now = new Date()
    let startTime = new Date()

    switch (period) {
      case 'day':
        startTime.setDate(now.getDate() - 1)
        break
      case 'week':
        startTime.setDate(now.getDate() - 7)
        break
      case 'month':
        startTime.setMonth(now.getMonth() - 1)
        break
    }

    const data = await generateReport(startTime, now)
    setReport(data)
    setLoading(false)
  }

  const downloadAsMarkdown = () => {
    if (!report) return

    const md = generateMarkdown(report)
    const blob = new Blob([md], { type: 'text/markdown' })
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
            Download outbound activity analysis as Markdown or JSON
          </p>
        </div>

        {/* Report Generator */}
        <div className="mb-8 rounded-lg border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold">Report Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Time Period
              </label>
              <div className="flex gap-3">
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border/50 bg-card/50 text-foreground hover:border-primary/50'
                    }`}
                  >
                    Last {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {report && (
          <>
            {/* Export Options */}
            <div className="mb-8 flex gap-3">
              <button
                onClick={downloadAsMarkdown}
                className="flex-1 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                Download as Markdown
              </button>
              <button
                onClick={downloadAsJSON}
                className="flex-1 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                Download as JSON
              </button>
            </div>

            {/* Report Display */}
            <div className="rounded-lg border border-border/40 bg-card/40 p-6 backdrop-blur-sm space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Network Activity Report</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="text-foreground">Generated:</span>{' '}
                    {report.generatedAt.toLocaleString()}
                  </p>
                  <p>
                    <span className="text-foreground">Period:</span>{' '}
                    {report.period.start.toLocaleDateString()} to{' '}
                    {report.period.end.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-border/20 pt-6">
                <h3 className="text-base font-semibold mb-4">Summary Statistics</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded border border-border/20 bg-card/30 p-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Total Events
                    </div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      {report.summary.totalEvents}
                    </div>
                  </div>
                  <div className="rounded border border-border/20 bg-card/30 p-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Unique Hosts
                    </div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      {report.summary.uniqueHosts}
                    </div>
                  </div>
                  <div className="rounded border border-border/20 bg-card/30 p-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Avg Latency
                    </div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      {report.summary.avgLatency}
                      <span className="text-sm text-muted-foreground">ms</span>
                    </div>
                  </div>
                  <div className="rounded border border-border/20 bg-card/30 p-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Risky Events
                    </div>
                    <div className="mt-1 text-2xl font-bold text-red-400">
                      {report.summary.riskDistribution.risky}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/20 pt-6">
                <h3 className="text-base font-semibold mb-4">Risk Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-emerald-400">Clean</span>
                      <span className="text-sm font-medium">
                        {report.summary.riskDistribution.clean} events
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${(report.summary.riskDistribution.clean / report.summary.totalEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-amber-400">Watch</span>
                      <span className="text-sm font-medium">
                        {report.summary.riskDistribution.watch} events
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{
                          width: `${(report.summary.riskDistribution.watch / report.summary.totalEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-red-400">Risky</span>
                      <span className="text-sm font-medium">
                        {report.summary.riskDistribution.risky} events
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${(report.summary.riskDistribution.risky / report.summary.totalEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/20 pt-6">
                <h3 className="text-base font-semibold mb-4">
                  Top Hosts ({Math.min(5, report.hosts.length)})
                </h3>
                <div className="space-y-2">
                  {report.hosts.slice(0, 5).map((host) => (
                    <div
                      key={host.id}
                      className="flex items-center justify-between rounded border border-border/20 bg-card/30 p-3"
                    >
                      <div>
                        <div className="font-mono text-sm font-semibold">{host.ip}</div>
                        <div className="text-xs text-muted-foreground">{host.hostname}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{host.totalEvents}</div>
                        <div className="text-xs text-muted-foreground">events</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!report && !loading && (
          <div className="rounded-lg border border-border/30 bg-card/30 p-8 text-center">
            <div className="text-muted-foreground">
              Select a time period and generate a report to get started
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function generateMarkdown(report: Report): string {
  return `# Outbounds Network Activity Report

**Generated:** ${report.generatedAt.toLocaleString()}
**Period:** ${report.period.start.toLocaleDateString()} to ${report.period.end.toLocaleDateString()}

## Summary

- **Total Events:** ${report.summary.totalEvents}
- **Unique Hosts:** ${report.summary.uniqueHosts}
- **Average Latency:** ${report.summary.avgLatency}ms

## Risk Distribution

- **Clean:** ${report.summary.riskDistribution.clean} events
- **Watch:** ${report.summary.riskDistribution.watch} events
- **Risky:** ${report.summary.riskDistribution.risky} events

## Top Hosts

${report.hosts
  .slice(0, 10)
  .map((host) => `- \`${host.ip}\` (${host.hostname}) - ${host.totalEvents} events`)
  .join('\n')}

## All Events

${report.events
  .map(
    (event) =>
      `- **${event.protocol.toUpperCase()}** ${event.sourceIp}:${event.sourcePort} → ${event.destinationHostname || event.destinationIp}:${event.destinationPort} [\`${event.status}\`] (${event.latency}ms, ${event.riskLevel})`,
  )
  .join('\n')}

---

*Outbounds v1.0 — Network Visibility Platform*
`
}

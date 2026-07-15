'use client'

import { FilterState } from '@/lib/types'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const PROTOCOLS = ['http', 'https', 'dns', 'tcp', 'udp']
const STATUSES = ['success', 'failed', 'timeout']
const RISK_LEVELS = ['clean', 'watch', 'risky']

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const handleProtocolChange = (protocol: string) => {
    onFilterChange({
      ...filters,
      protocol: filters.protocol === protocol ? undefined : protocol,
    })
  }

  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      status: filters.status === status ? undefined : (status as any),
    })
  }

  const handleRiskChange = (risk: string) => {
    onFilterChange({
      ...filters,
      riskLevel: filters.riskLevel === risk ? undefined : (risk as any),
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchTerm: e.target.value || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by host, IP, or domain..."
          value={filters.searchTerm || ''}
          onChange={handleSearch}
          className="w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center">
            Protocol:
          </span>
          {PROTOCOLS.map((protocol) => (
            <button
              key={protocol}
              onClick={() => handleProtocolChange(protocol)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                filters.protocol === protocol
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/50 bg-card/50 text-foreground hover:border-primary/50'
              }`}
            >
              {protocol.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center">
            Risk:
          </span>
          {RISK_LEVELS.map((risk) => (
            <button
              key={risk}
              onClick={() => handleRiskChange(risk)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                filters.riskLevel === risk
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/50 bg-card/50 text-foreground hover:border-primary/50'
              }`}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center">
            Status:
          </span>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                filters.status === status
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/50 bg-card/50 text-foreground hover:border-primary/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

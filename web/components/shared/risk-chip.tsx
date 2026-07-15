import { RiskLevel, Tone } from '@/lib/types'

interface RiskChipProps {
  level: RiskLevel
  tone?: Tone
  className?: string
}

const RISK_LABELS = {
  serious: {
    clean: 'Clean',
    watch: 'Watch',
    risky: 'Risky',
  },
  story: {
    clean: 'Clean',
    watch: 'Side-eyeing',
    risky: 'Caught red-handed',
  },
}

const RISK_COLORS = {
  clean: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  watch: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  risky: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export function RiskChip({ level, tone = 'serious', className = '' }: RiskChipProps) {
  const label = RISK_LABELS[tone][level]
  const colors = RISK_COLORS[level]

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors} ${className}`}>
      {label}
    </span>
  )
}

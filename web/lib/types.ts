export type RiskLevel = 'clean' | 'watch' | 'risky'

export type Tone = 'serious' | 'story'

export interface Host {
  id: string
  ip: string
  hostname: string
  region: string
  lastSeen: Date
  totalEvents: number
  riskLevel: RiskLevel
  riskReasons: string[]
}

export interface NetworkEvent {
  id: string
  timestamp: Date
  hostId: string
  direction: 'outbound' | 'inbound'
  protocol: 'http' | 'https' | 'dns' | 'tcp' | 'udp' | 'other'
  sourceIp: string
  sourcePort: number
  destinationIp: string
  destinationPort: number
  destinationHostname?: string
  dataTransferred: number
  latency: number
  status: 'success' | 'failed' | 'timeout'
  riskLevel: RiskLevel
  reason?: string
  details?: Record<string, string>
}

export interface FilterState {
  riskLevel?: RiskLevel
  protocol?: string
  status?: 'success' | 'failed' | 'timeout'
  searchTerm?: string
}

export interface OverviewStats {
  activeHosts: number
  failedDns: number
  highLatency: number
  eventsInWindow: number
  windowSec: number
}

export interface CaptureStatus {
  mode: 'live' | 'replay' | 'idle'
  online: boolean
  lastHeartbeatAt: string | null
  sessionId: string | null
  source?: string
}

export interface Report {
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalEvents: number
    uniqueHosts: number
    avgLatency: number
    riskDistribution: Record<RiskLevel, number>
  }
  hosts: Host[]
  events: NetworkEvent[]
}

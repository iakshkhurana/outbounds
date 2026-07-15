import { Host, NetworkEvent, RiskLevel } from './types'

const RISK_LEVELS: RiskLevel[] = ['clean', 'watch', 'risky']

export const mockHosts: Host[] = [
  {
    id: '192.168.1.100',
    ip: '192.168.1.100',
    hostname: 'workstation-01.local',
    region: 'US-East',
    lastSeen: new Date(Date.now() - 2 * 60000),
    totalEvents: 127,
    riskLevel: 'clean',
    riskReasons: ['Normal enterprise traffic'],
  },
  {
    id: '192.168.1.101',
    ip: '192.168.1.101',
    hostname: 'dev-server.local',
    region: 'US-East',
    lastSeen: new Date(Date.now() - 5 * 60000),
    totalEvents: 342,
    riskLevel: 'watch',
    riskReasons: ['Unusual time pattern', 'Large data transfer'],
  },
  {
    id: '192.168.1.102',
    ip: '192.168.1.102',
    hostname: 'unknown-device.local',
    region: 'Unknown',
    lastSeen: new Date(Date.now() - 1 * 60000),
    totalEvents: 89,
    riskLevel: 'risky',
    riskReasons: ['Suspicious destination', 'Failed DNS resolution', 'Multiple failed connections'],
  },
  {
    id: '192.168.1.103',
    ip: '192.168.1.103',
    hostname: 'jenkins-ci.local',
    region: 'US-East',
    lastSeen: new Date(Date.now() - 30000),
    totalEvents: 2104,
    riskLevel: 'clean',
    riskReasons: ['Legitimate CI/CD traffic'],
  },
  {
    id: '192.168.1.104',
    ip: '192.168.1.104',
    hostname: 'database-replica.local',
    region: 'US-West',
    lastSeen: new Date(Date.now() - 45000),
    totalEvents: 891,
    riskLevel: 'watch',
    riskReasons: ['High latency detected', 'Intermittent connectivity'],
  },
]

export const mockEvents: NetworkEvent[] = [
  {
    id: 'evt-001',
    timestamp: new Date(Date.now() - 10000),
    hostId: '192.168.1.100',
    direction: 'outbound',
    protocol: 'https',
    sourceIp: '192.168.1.100',
    sourcePort: 52841,
    destinationIp: '93.184.216.34',
    destinationPort: 443,
    destinationHostname: 'api.github.com',
    dataTransferred: 4096,
    latency: 45,
    status: 'success',
    riskLevel: 'clean',
    reason: 'GitHub API access',
  },
  {
    id: 'evt-002',
    timestamp: new Date(Date.now() - 8000),
    hostId: '192.168.1.101',
    direction: 'outbound',
    protocol: 'https',
    sourceIp: '192.168.1.101',
    sourcePort: 49201,
    destinationIp: '104.16.132.229',
    destinationPort: 443,
    destinationHostname: 'cdn.jsdelivr.net',
    dataTransferred: 2048576,
    latency: 32,
    status: 'success',
    riskLevel: 'clean',
    reason: 'CDN access',
  },
  {
    id: 'evt-003',
    timestamp: new Date(Date.now() - 6500),
    hostId: '192.168.1.102',
    direction: 'outbound',
    protocol: 'dns',
    sourceIp: '192.168.1.102',
    sourcePort: 53452,
    destinationIp: '8.8.8.8',
    destinationPort: 53,
    destinationHostname: 'google-dns',
    dataTransferred: 128,
    latency: 12,
    status: 'failed',
    riskLevel: 'risky',
    reason: 'Failed DNS resolution to suspicious domain',
    details: { queriedDomain: 'suspicious-domain.xyz' },
  },
  {
    id: 'evt-004',
    timestamp: new Date(Date.now() - 5200),
    hostId: '192.168.1.102',
    direction: 'outbound',
    protocol: 'tcp',
    sourceIp: '192.168.1.102',
    sourcePort: 41203,
    destinationIp: '185.199.108.154',
    destinationPort: 8080,
    dataTransferred: 0,
    latency: 3000,
    status: 'timeout',
    riskLevel: 'risky',
    reason: 'High latency connection timeout to unusual port',
  },
  {
    id: 'evt-005',
    timestamp: new Date(Date.now() - 3900),
    hostId: '192.168.1.103',
    direction: 'outbound',
    protocol: 'https',
    sourceIp: '192.168.1.103',
    sourcePort: 53124,
    destinationIp: '140.82.113.3',
    destinationPort: 443,
    destinationHostname: 'github.com',
    dataTransferred: 1024576,
    latency: 48,
    status: 'success',
    riskLevel: 'clean',
    reason: 'Repository clone operation',
  },
  {
    id: 'evt-006',
    timestamp: new Date(Date.now() - 2100),
    hostId: '192.168.1.100',
    direction: 'outbound',
    protocol: 'https',
    sourceIp: '192.168.1.100',
    sourcePort: 52842,
    destinationIp: '1.1.1.1',
    destinationPort: 443,
    destinationHostname: 'cloudflare-dns.com',
    dataTransferred: 256,
    latency: 22,
    status: 'success',
    riskLevel: 'clean',
    reason: 'DNS query via DoH',
  },
  {
    id: 'evt-007',
    timestamp: new Date(Date.now() - 1500),
    hostId: '192.168.1.104',
    direction: 'outbound',
    protocol: 'tcp',
    sourceIp: '192.168.1.104',
    sourcePort: 35601,
    destinationIp: '192.168.1.50',
    destinationPort: 5432,
    destinationHostname: 'db-primary.local',
    dataTransferred: 8192,
    latency: 892,
    status: 'success',
    riskLevel: 'watch',
    reason: 'Database replication - higher than normal latency',
    details: { expectedLatency: '50ms', actualLatency: '892ms' },
  },
  {
    id: 'evt-008',
    timestamp: new Date(Date.now() - 800),
    hostId: '192.168.1.101',
    direction: 'outbound',
    protocol: 'https',
    sourceIp: '192.168.1.101',
    sourcePort: 49202,
    destinationIp: '172.217.16.142',
    destinationPort: 443,
    destinationHostname: 'analytics.google.com',
    dataTransferred: 512,
    latency: 78,
    status: 'success',
    riskLevel: 'watch',
    reason: 'Telemetry data - flagged as unusual volume',
  },
  {
    id: 'evt-009',
    timestamp: new Date(Date.now() - 200),
    hostId: '192.168.1.100',
    direction: 'outbound',
    protocol: 'https',
    sourceIp: '192.168.1.100',
    sourcePort: 52843,
    destinationIp: '93.184.216.35',
    destinationPort: 443,
    destinationHostname: 'npm.registry.com',
    dataTransferred: 512000,
    latency: 51,
    status: 'success',
    riskLevel: 'clean',
    reason: 'Package registry access',
  },
]

export function getHostById(id: string): Host | undefined {
  const host = mockHosts.find((h) => h.id === id)
  if (host) {
    return {
      ...host,
      lastSeen: new Date(host.lastSeen),
    }
  }
  return undefined
}

export function getEventsByHostId(hostId: string): NetworkEvent[] {
  return mockEvents
    .filter((e) => e.hostId === hostId)
    .map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }))
}

export function getAllHosts(): Host[] {
  return mockHosts.map((h) => ({
    ...h,
    lastSeen: new Date(h.lastSeen),
  }))
}

export function getAllEvents(): NetworkEvent[] {
  return mockEvents.map((e) => ({
    ...e,
    timestamp: new Date(e.timestamp),
  }))
}

export function getEventsByRiskLevel(level: RiskLevel): NetworkEvent[] {
  return mockEvents.filter((e) => e.riskLevel === level)
}

export function getEventsByProtocol(protocol: string): NetworkEvent[] {
  return mockEvents.filter((e) => e.protocol === protocol)
}

export function filterEvents(
  events: NetworkEvent[],
  filters: {
    riskLevel?: RiskLevel
    protocol?: string
    status?: 'success' | 'failed' | 'timeout'
    hostId?: string
  },
): NetworkEvent[] {
  return events.filter((event) => {
    if (filters.riskLevel && event.riskLevel !== filters.riskLevel) return false
    if (filters.protocol && event.protocol !== filters.protocol) return false
    if (filters.status && event.status !== filters.status) return false
    if (filters.hostId && event.hostId !== filters.hostId) return false
    return true
  })
}

export function getNetworkStats() {
  const totalEvents = mockEvents.length
  const uniqueHosts = new Set(mockEvents.map((e) => e.hostId)).size
  const avgLatency = Math.round(mockEvents.reduce((sum, e) => sum + e.latency, 0) / totalEvents)
  const failedEvents = mockEvents.filter((e) => e.status !== 'success').length

  const riskDistribution = {
    clean: mockEvents.filter((e) => e.riskLevel === 'clean').length,
    watch: mockEvents.filter((e) => e.riskLevel === 'watch').length,
    risky: mockEvents.filter((e) => e.riskLevel === 'risky').length,
  }

  return {
    totalEvents,
    uniqueHosts,
    avgLatency,
    failedEvents,
    riskDistribution,
  }
}

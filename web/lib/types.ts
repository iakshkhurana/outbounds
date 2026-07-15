// Network event severity levels
export type RiskLevel = 'clean' | 'watch' | 'risky';

// Tone for display labels
export type Tone = 'serious' | 'story';

// Host information
export interface Host {
  id: string;
  ip: string;
  hostname: string;
  region: string;
  lastSeen: Date;
  totalEvents: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
}

// Network event details
export interface NetworkEvent {
  id: string;
  timestamp: Date;
  hostId: string;
  direction: 'outbound' | 'inbound';
  protocol: 'http' | 'https' | 'dns' | 'tcp' | 'udp';
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  destinationHostname?: string;
  dataTransferred: number; // bytes
  latency: number; // ms
  status: 'success' | 'failed' | 'timeout';
  riskLevel: RiskLevel;
  reason?: string;
  details?: Record<string, string>;
}

// Filter state
export interface FilterState {
  riskLevel?: RiskLevel;
  protocol?: string;
  status?: 'success' | 'failed' | 'timeout';
  searchTerm?: string;
}

// Report data structure
export interface Report {
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    uniqueHosts: number;
    avgLatency: number;
    riskDistribution: Record<RiskLevel, number>;
  };
  hosts: Host[];
  events: NetworkEvent[];
}

import { describe, expect, it } from 'vitest'
import { assessEvent, mergeHostRisk } from '../risk/engine.js'
import type { EventInput } from '../schemas/event.js'

const base: EventInput = {
  ts: '2026-07-15T03:40:00.000Z',
  ip: '1.1.1.1',
  hostname: 'one.one.one.one',
  protocol: 'dns',
  direction: 'out',
  dstPort: 53,
  domain: 'example.com',
  dnsStatus: 'ok',
  latencyMs: 18,
  bytesOut: 64,
  bytesIn: 120,
  tags: [],
}

describe('assessEvent', () => {
  it('marks failed DNS as watch', () => {
    const result = assessEvent({ ...base, dnsStatus: 'failed' })
    expect(result.riskLevel).toBe('watch')
    expect(result.riskReasons.some((r) => r.includes('DNS'))).toBe(true)
  })

  it('escalates repeated DNS failures to risky', () => {
    const result = assessEvent({ ...base, dnsStatus: 'timeout' }, { burstCount: 4 })
    expect(result.riskLevel).toBe('risky')
  })

  it('flags high latency', () => {
    const result = assessEvent({ ...base, protocol: 'tcp', dnsStatus: 'unknown', latencyMs: 400 })
    expect(result.riskLevel).toBe('watch')
    expect(result.tags).toContain('high_latency')
  })

  it('flags unusual ports', () => {
    const result = assessEvent({
      ...base,
      protocol: 'tcp',
      dnsStatus: 'unknown',
      dstPort: 5555,
      latencyMs: 20,
    })
    expect(result.riskLevel).toBe('watch')
    expect(result.tags).toContain('unusual_port')
  })

  it('keeps clean traffic clean', () => {
    const result = assessEvent({
      ...base,
      protocol: 'tcp',
      dnsStatus: 'unknown',
      dstPort: 443,
      domain: null,
      latencyMs: 40,
    })
    expect(result.riskLevel).toBe('clean')
    expect(result.riskReasons).toHaveLength(0)
  })
})

describe('mergeHostRisk', () => {
  it('keeps the higher severity', () => {
    const merged = mergeHostRisk('clean', [], {
      riskLevel: 'watch',
      riskReasons: ['High latency'],
      tags: ['high_latency'],
    })
    expect(merged.riskLevel).toBe('watch')
  })
})

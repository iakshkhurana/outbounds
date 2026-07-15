import { z } from 'zod'

export const eventInputSchema = z.object({
  ts: z.string().datetime(),
  ip: z.string().min(1),
  hostname: z.string().nullable().optional(),
  protocol: z.enum(['tcp', 'udp', 'dns', 'other']),
  direction: z.enum(['out', 'in', 'unknown']).optional().default('out'),
  srcPort: z.number().int().nullable().optional(),
  dstPort: z.number().int().nullable().optional(),
  domain: z.string().nullable().optional(),
  dnsStatus: z.enum(['ok', 'failed', 'timeout', 'unknown']).optional().default('unknown'),
  latencyMs: z.number().nullable().optional(),
  processName: z.string().nullable().optional(),
  bytesOut: z.number().int().nonnegative().optional().default(0),
  bytesIn: z.number().int().nonnegative().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
})

export const ingestBatchSchema = z.object({
  batchId: z.string().min(1),
  sessionId: z.string().optional(),
  events: z.array(eventInputSchema).min(1).max(500),
})

export const heartbeatSchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum(['live', 'replay']),
  source: z.string().min(1),
})

export type EventInput = z.infer<typeof eventInputSchema>
export type IngestBatch = z.infer<typeof ingestBatchSchema>

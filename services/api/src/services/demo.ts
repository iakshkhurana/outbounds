import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eventInputSchema, type EventInput } from '../schemas/event.js'
import { ingestBatch } from './ingest.js'
import { prisma } from '../db.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../')
const defaultSamplePath = path.join(rootDir, 'sample-data', 'events.jsonl')

export async function loadSampleEvents(
  samplePath = defaultSamplePath,
): Promise<EventInput[]> {
  const raw = await readFile(samplePath, 'utf8')
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((line, index) => {
    const parsed = eventInputSchema.safeParse(JSON.parse(line))
    if (!parsed.success) {
      throw new Error(`Invalid sample event on line ${index + 1}: ${parsed.error.message}`)
    }
    return parsed.data
  })
}

export async function replaySampleData(samplePath = defaultSamplePath) {
  const events = await loadSampleEvents(samplePath)
  const now = Date.now()
  const shifted = events.map((event, index) => ({
    ...event,
    // Keep relative spacing, land events in the recent window for overview demos
    ts: new Date(now - (events.length - index) * 1000).toISOString(),
  }))

  const result = await ingestBatch({
    batchId: randomUUID(),
    sessionId: `replay-${Date.now()}`,
    events: shifted,
  })

  await prisma.captureSession.create({
    data: {
      mode: 'replay',
      source: 'sample-data/events.jsonl',
      lastHeartbeatAt: new Date(),
    },
  })

  return result
}

export async function resetDemoData() {
  await prisma.event.deleteMany()
  await prisma.host.deleteMany()
  await prisma.captureSession.deleteMany()
}

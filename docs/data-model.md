# Outbounds — Data Model

## Principles

- Store **metadata**, not payloads
- Prefer append-only events + rolled-up hosts
- Keep schema tiny for v1

## Entities

### Host

Represents a remote destination.

| Field | Type | Notes |
|---|---|---|
| id | string (cuid) | PK |
| ip | string | required |
| hostname | string? | reverse DNS / SNI / DNS answer if known |
| firstSeenAt | datetime | |
| lastSeenAt | datetime | |
| bytesOut | int | best-effort |
| bytesIn | int | best-effort |
| eventCount | int | |
| avgLatencyMs | float? | nullable |
| riskLevel | enum `clean \| watch \| risky` | derived |
| riskReasons | string[] / JSON | human-readable reasons |
| createdAt | datetime | |
| updatedAt | datetime | |

### Event

One observed outbound interaction / sample.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| hostId | string | FK |
| ts | datetime | event time |
| direction | enum `out \| in \| unknown` | v1 mostly `out` |
| protocol | enum `tcp \| udp \| dns \| other` | |
| srcPort | int? | |
| dstPort | int? | |
| domain | string? | DNS query name if DNS |
| dnsStatus | enum `ok \| failed \| timeout \| unknown` | |
| latencyMs | float? | measured or inferred |
| processName | string? | optional if OS allows |
| tags | string[] / JSON | e.g. `high_latency` |
| rawMeta | JSON? | small debug bag; never store payload bytes |

### CaptureSession (optional but useful)

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| startedAt | datetime | |
| endedAt | datetime? | |
| mode | enum `live \| replay` | |
| source | string | iface name or `sample-data` |
| lastHeartbeatAt | datetime? | |

## Event ingest payload (sniffer → API)

```json
{
  "batchId": "uuid",
  "sessionId": "optional",
  "events": [
    {
      "ts": "2026-07-15T03:40:00.000Z",
      "ip": "1.1.1.1",
      "hostname": "one.one.one.one",
      "protocol": "dns",
      "dstPort": 53,
      "domain": "example.com",
      "dnsStatus": "ok",
      "latencyMs": 18,
      "processName": null,
      "bytesOut": 64,
      "bytesIn": 120
    }
  ]
}
```

## Risk rules (v1 — deterministic)

Compute on ingest / periodically:

1. **Failed DNS** — `dnsStatus in failed|timeout` → at least `watch`
2. **High latency** — `latencyMs >= 250` → tag + maybe `watch`
3. **Unusual port** — not in `{80,443,53,123,22,8080,8443}` and bursty → `watch`
4. **Burst novelty** — new host with many events in <10s → `watch`
5. **Risky escalate** — failed DNS **and** repeated attempts → `risky`

Tone labels (UI only; don’t store slang in Serious mode):

| Serious | Story |
|---|---|
| Clean | Clean |
| Watch | Side-eyeing |
| Risky | Caught red-handed |

## Indexes

- Event: `(ts DESC)`, `(hostId, ts DESC)`
- Host: `(lastSeenAt DESC)`, `(riskLevel)`, `(hostname)`, `(ip)`

# Outbounds — Architecture

## High-level

```text
┌────────────────────┐     JSON events      ┌──────────────────────────┐
│  Python Sniffer    │ ───────────────────► │  Next.js API + Prisma    │
│  (live pcap)       │   POST /api/events   │  SQLite                  │
└────────────────────┘                      └────────────┬─────────────┘
                                                         │
┌────────────────────┐                                   │
│  Replay / sample   │ ──────────────────────────────────┤
│  events.jsonl      │                                   ▼
└────────────────────┘                      ┌──────────────────────────┐
                                            │  Dashboard (React)       │
                                            │  Overview / Host / Report│
                                            └──────────────────────────┘
```

## Components

### 1) Sniffer (`services/sniffer`)

Responsibilities:

- Capture outbound packets / flows (best-effort metadata)
- Normalize to Event schema
- Batch POST to API every ~1s
- Heartbeat ping so UI shows “Capturing”

Does **not**:

- Decrypt TLS
- Persist long-term state (API owns storage)
- Enforce firewall rules (v1)

### 2) API (Next.js)

Responsibilities:

- Validate token
- Validate event payloads (zod)
- Upsert hosts + insert events
- Run risk scoring hooks
- Query endpoints for UI + report export

### 3) Web UI

Responsibilities:

- Overview metrics + feed
- Host detail
- Filters
- Tone toggle
- Export report button

## Data flow (happy path)

1. Packet seen → sniffer builds Event
2. Event batched → `POST /api/events`
3. API validates → writes DB → updates host aggregates
4. UI polls (2–3s) or uses lightweight SSE (optional P1)
5. Risk engine tags host/event with reasons

## Trust boundary

- Sniffer is local trusted process
- Shared token prevents random LAN posts in demos
- No multi-tenant security model in v1
- Treat all network data as sensitive on disk (local only)

## Failure modes (design for them)

| Failure | Behavior |
|---|---|
| No pcap permissions | UI offers Replay mode |
| Sniffer offline | Show stale heartbeat + banner |
| Bad event payload | 400 + log; don’t crash ingest |
| DB locked | Retry once; surface toast |

## Scalability note (interview line)

v1 is single-machine SQLite by design. Path to growth: Postgres, append-only event store, and streaming ingest — not needed for portfolio scope.

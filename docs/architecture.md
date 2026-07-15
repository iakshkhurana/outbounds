# Outbounds — Architecture

## High-level (microservices)

```text
┌────────────────────┐     JSON events      ┌──────────────────────────┐
│  sniffer service   │ ───────────────────► │  api service :4000       │
│  (Python)          │   POST /api/events   │  SQLite + risk engine    │
└────────────────────┘                      └────────────┬─────────────┘
                                                         │ REST JSON
┌────────────────────┐                                   │
│  sample-data/      │ ── replay via API ────────────────┤
│  *.jsonl           │                                   ▼
└────────────────────┘                      ┌──────────────────────────┐
                                            │  web :3000               │
                                            │  Next.js UI only         │
                                            └──────────────────────────┘
```

Three units. No shared JS monorepo tooling required.

## Components

### 1) `services/sniffer`

- Capture outbound metadata (best-effort)
- Normalize → Event schema
- Batch POST to API + heartbeat
- Dry-run mode without pcap

### 2) `services/api`

- Token-auth ingest
- Persist hosts/events
- Risk scoring
- Query + report endpoints
- Demo replay/reset (env-gated)

### 3) `web`

- Product UI only
- Calls API via `NEXT_PUBLIC_API_URL`
- Graceful fallback when API is unavailable

## Trust boundary

- Sniffer + API are local trusted processes
- Shared ingest token on write endpoints
- Web is read-mostly (+ demo actions)
- Metadata only; no payload storage

## Failure modes

| Failure | Behavior |
|---|---|
| No pcap permissions | Replay via API |
| Sniffer offline | Capture status Offline |
| API down | Web uses mock fallback + error banner |
| Bad event payload | 400; ingest continues |

## Growth note

Later: split DB, add Postgres, stream ingest. Not v1.

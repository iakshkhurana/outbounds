# Outbounds — Stack

## Decision summary

| Layer | Choice | Why |
|---|---|---|
| Web UI | **Next.js (App Router) + TypeScript + Tailwind** in `web/` | Separate frontend service |
| API | **TypeScript** service in `services/api` (Fastify or Express) | Owns persistence, risk, and query API |
| DB | **SQLite + Prisma** (API-owned) | Local, zero ops for v1 |
| Sniffer | **Python** service in `services/sniffer` | Capture worker posts JSON to API |
| Charts | Recharts (web) | Simple destination / latency visuals |

## Repo layout

```text
outbounds/
  web/                    # Frontend service
  services/
    api/                  # Ingest, query, risk, report
    sniffer/              # Packet metadata capture
  sample-data/            # Replay fixtures
  docs/
  README.md
```

Three deployable services: **web**, **api**, **sniffer**.

## Runtime modes

1. **Live capture** — sniffer → API → web  
2. **Replay** — API loads `sample-data/*.jsonl`

## Ports

| Service | Port |
|---|---|
| web | 3000 |
| api | 4000 |
| sniffer | none (outbound client) |

## Env (web)

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
OUTBOUNDS_TONE_DEFAULT="serious"
```

## Env (api)

```bash
PORT=4000
DATABASE_URL="file:./dev.db"
SNIFFER_SHARED_TOKEN="dev-local-token"
ALLOW_DEMO_REPLAY=true
```

## Env (sniffer)

```bash
OUTBOUNDS_API_URL="http://localhost:4000/api/events"
OUTBOUNDS_TOKEN="dev-local-token"
CAPTURE_IFACE=""
BATCH_MS=1000
```

## Out of scope (v1)

- Turborepo / nx
- Redis, Kafka, k8s
- Hosted auth providers
- Electron / mobile clients

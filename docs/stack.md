# Outbounds — Stack

## Decision summary

| Layer | Choice | Why |
|---|---|---|
| Web app | **Next.js (App Router) + TypeScript** | You know TS full-stack; fast polished UI |
| UI | **Tailwind CSS** + custom CSS vars | Control look; avoid generic component mush |
| Charts | **Recharts** | Simple latency / top-hosts charts |
| API | Next.js Route Handlers (or tRPC if already comfy) | One repo; keep simple |
| DB | **SQLite + Prisma** | Local, zero ops, portfolio-friendly |
| Sniffer | **Python 3** + `scapy` or `pyshark` | Cisco JD alignment + easier packet work |
| Transport | HTTP POST JSON from sniffer → `/api/events` | Clear boundary |
| Repo tooling | pnpm or npm, ESLint, Prettier | Consistency |
| Optional run | Docker Compose (`web` + `sniffer`) | One-command demo |

## Repo layout (target)

```text
outbounds/
  apps/web/                 # Next.js
  services/sniffer/         # Python worker
  docs/                     # this folder
  docker-compose.yml
  README.md
  sample-data/events.jsonl
```

## Runtime modes

1. **Live capture** — sniffer running with privileges / Npcap on Windows
2. **Replay mode** — web ingests `sample-data/events.jsonl` (demo-safe default)

Always ship replay mode so referral demos never die on permissions.

## Environment vars (web)

```bash
DATABASE_URL="file:./dev.db"
SNIFFER_SHARED_TOKEN="dev-local-token"   # sniffer sends as header
OUTBOUNDS_TONE_DEFAULT="serious"         # serious | story
```

## Environment vars (sniffer)

```bash
OUTBOUNDS_API_URL="http://localhost:3000/api/events"
OUTBOUNDS_TOKEN="dev-local-token"
CAPTURE_IFACE=""          # empty = auto
BATCH_MS=1000
```

## What we intentionally skip (v1)

- Redis, Kafka, k8s
- Auth providers (Auth0/Clerk)
- Postgres (unless you already want it)
- Electron wrapper
- Mobile clients

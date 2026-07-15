# Outbounds — Build TODO

Order matters. UI polish without data flow comes later.

## Phase 0 — Skeleton

- [x] Service layout: `web/`, `services/api`, `services/sniffer`, `docs`
- [ ] Sample JSONL fixtures in `sample-data/`
- [ ] README run paths verified for three services

## Phase 1 — API (`services/api`)

- [ ] Fastify/Express + TypeScript scaffold
- [ ] Prisma schema from `data-model.md`
- [ ] zod EventInput schema
- [ ] `POST /api/events` + token auth
- [ ] Host upsert + event insert
- [ ] Risk engine + unit tests
- [ ] `GET /api/overview`, `GET /api/hosts`, `GET /api/hosts/:id`
- [ ] Demo replay + reset (env-gated)
- [ ] CORS for `http://localhost:3000`

## Phase 2 — Web (`web/`)

- [ ] Next.js UI (overview, host detail, report)
- [ ] `NEXT_PUBLIC_API_URL` → API `:4000`
- [ ] Wire live fetch + offline fallback
- [ ] Empty / loading / error states, tone toggle, export

## Phase 3 — Sniffer (`services/sniffer`)

- [ ] Python project + requirements
- [ ] Dry-run emitter (no pcap)
- [ ] Live capture path (Scapy/pyshark) best-effort
- [ ] Batch POST + heartbeat
- [ ] Windows Npcap notes in README

## Phase 4 — Integration

- [ ] `GET /api/report` Markdown export
- [ ] Optional Docker Compose (web + api + sniffer)
- [ ] README screenshots

## Later / out of scope

- [ ] JS monorepo tooling
- [ ] Enforcing firewall / blocking
- [ ] eBPF
- [ ] Multi-device agents
- [ ] Cloud SaaS auth

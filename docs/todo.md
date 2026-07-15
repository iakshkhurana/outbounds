# Outbounds — Build TODO

Order matters. UI polish without data flow comes later.

## Phase 0 — Skeleton

- [x] Service layout: `web/`, `services/api`, `services/sniffer`, `docs`
- [x] Sample JSONL fixtures in `sample-data/`
- [x] README run paths verified for three services

## Phase 1 — API (`services/api`)

- [x] Fastify/Express + TypeScript scaffold
- [x] Prisma schema from `data-model.md`
- [x] zod EventInput schema
- [x] `POST /api/events` + token auth
- [x] Host upsert + event insert
- [x] Risk engine + unit tests
- [x] `GET /api/overview`, `GET /api/hosts`, `GET /api/hosts/:id`
- [x] Demo replay + reset (env-gated)
- [x] CORS for `http://localhost:3000`
- [x] Capture heartbeat + status
- [x] `GET /api/report`

## Phase 2 — Web (`web/`)

- [x] Next.js UI scaffold (overview, host detail, report)
- [x] Component layout organized by feature
- [x] Live API wiring verified against `services/api`
- [x] Empty / loading / error polish pass
- [x] Capture status reflects real heartbeat

## Phase 3 — Sniffer (`services/sniffer`)

- [x] Python project + requirements
- [x] Dry-run emitter (no pcap)
- [ ] Live capture path (Scapy/pyshark) best-effort
- [x] Batch POST + heartbeat
- [x] Windows Npcap notes in README

## Phase 4 — Integration

- [x] `GET /api/report` Markdown export
- [x] Optional Docker Compose (web + api + sniffer)
- [ ] README screenshots

## Later / out of scope

- [ ] JS monorepo tooling
- [ ] Enforcing firewall / blocking
- [ ] eBPF
- [ ] Multi-device agents
- [ ] Cloud SaaS auth

# Outbounds — Build TODO

Order matters. UI polish without data flow comes later.

## Phase 0 — Skeleton

- [x] Service layout: `web/`, `services/api`, `services/sniffer`, `docs`
- [ ] Sample JSONL fixtures in `sample-data/`
- [ ] README run paths verified for three services

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
- [ ] Live API wiring verified against `services/api`
- [ ] Empty / loading / error polish pass
- [ ] Capture status reflects real heartbeat

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

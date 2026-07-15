# Outbounds — Build TODO

Order matters. Don’t skip ahead to lipstick without data flow.

## Phase 0 — Skeleton

- [ ] Init monorepo / folders: `apps/web`, `services/sniffer`, `sample-data`, `docs`
- [ ] Next.js + Tailwind + CSS variables theme
- [ ] Prisma schema from `data-model.md`
- [ ] README stub with name + limitations
- [ ] Sample JSONL fixtures

## Phase 1 — API + risk

- [ ] zod EventInput schema
- [ ] `POST /api/events` + token auth
- [ ] Host upsert + event insert
- [ ] Risk engine + unit tests
- [ ] `GET /api/overview`, `GET /api/hosts`, `GET /api/hosts/:id`
- [ ] Demo replay + reset (env-gated)

## Phase 2 — UI (polish early)

- [ ] Home: brand **Outbounds** + 3 metrics + live feed
- [ ] Host detail page
- [ ] Filters / search
- [ ] Capture status chip
- [ ] Serious/Story toggle
- [ ] Empty / loading / error states
- [ ] Subtle motion (pulse + row fade)

## Phase 3 — Sniffer

- [ ] Python project + requirements
- [ ] Dry-run emitter (no pcap)
- [ ] Live capture path (Scapy/pyshark) best-effort
- [ ] Batch POST + heartbeat
- [ ] Windows notes (Npcap) in README

## Phase 4 — Report + demo readiness

- [ ] `GET /api/report` Markdown export
- [ ] Docker Compose (web + sniffer optional)
- [ ] Screenshots in README

## Explicitly later / out of scope

- [ ] Real blocking firewall
- [ ] eBPF
- [ ] Multi-device agents
- [ ] Cloud SaaS auth

# Outbounds

**See who your device is really talking to.**

Local network visibility for outbound connections — DNS failures, latency ghosts, and unexpected destinations. Metadata only. No TLS decryption.

> Status: docs-first. Implementation follows `docs/todo.md`.

## Why this exists

Quick answers without firing up a full packet forensics workflow. Built as a portfolio project with networking + full-stack craft (Cisco-aligned themes, honest scope).

## Stack

- **Web/API:** Next.js · TypeScript · Tailwind · Prisma · SQLite  
- **Sniffer:** Python (Scapy/pyshark) → JSON ingest  
- **Demo safety:** Replay mode via sample JSONL  

Details: [`docs/stack.md`](docs/stack.md)

## Docs

| Doc | Purpose |
|---|---|
| [overview.md](docs/overview.md) | What / not |
| [prd.md](docs/prd.md) | Scope & stories |
| [architecture.md](docs/architecture.md) | System shape |
| [data-model.md](docs/data-model.md) | Schema & risk rules |
| [api.md](docs/api.md) | Endpoints |
| [stack.md](docs/stack.md) | Tech choices |
| [conventions.md](docs/conventions.md) | How to code it |
| [decisions.md](docs/decisions.md) | ADRs |
| [testing.md](docs/testing.md) | Test strategy |
| [todo.md](docs/todo.md) | Build order |

## Run (target — after Phase 0)

```bash
# web
cd apps/web && pnpm install && pnpm dev

# sniffer (optional live)
cd services/sniffer && python -m venv .venv && # activate then
pip install -r requirements.txt && python main.py
```

Replay mode should work even when capture cannot.

## Limitations (read this)

- Not a firewall, IDS, or MITM proxy  
- Best-effort process attribution depending on OS  
- Windows live capture may need Npcap + privileges  
- Single-machine SQLite; not multi-tenant SaaS  

## License

MIT (intended).

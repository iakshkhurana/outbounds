# Outbounds

**See who your device is really talking to.**

Outbounds is a local network visibility tool. It shows outbound destinations, DNS failures, latency issues, and unexpected connections — metadata only, no TLS decryption.

## Architecture

Three services:

| Service | Role | Default |
|---|---|---|
| `web/` | Product UI (Next.js) | `:3000` |
| `services/api/` | Ingest, query, risk, reports | `:4000` |
| `services/sniffer/` | Capture worker (Python) | posts to API |

```text
sniffer ──events──► api ──REST──► web
                      ▲
                 sample-data (replay)
```

## Stack

- **web:** Next.js · TypeScript · Tailwind  
- **api:** TypeScript · Prisma · SQLite  
- **sniffer:** Python  

See [`docs/stack.md`](docs/stack.md).

## Docs

| Doc | Purpose |
|---|---|
| [overview.md](docs/overview.md) | Product summary |
| [prd.md](docs/prd.md) | Requirements |
| [architecture.md](docs/architecture.md) | System design |
| [data-model.md](docs/data-model.md) | Schema & risk rules |
| [api.md](docs/api.md) | HTTP API |
| [stack.md](docs/stack.md) | Tech choices |
| [conventions.md](docs/conventions.md) | Engineering conventions |
| [decisions.md](docs/decisions.md) | Design decisions |
| [testing.md](docs/testing.md) | Test strategy |
| [todo.md](docs/todo.md) | Build order |

## Run

```bash
# API
cd services/api && npm run dev

# Web
cd web && npm run dev

# Sniffer (optional)
cd services/sniffer && python main.py
```

Replay mode works without live capture.

## Limits

- Not a firewall, IDS, or MITM proxy  
- Process attribution is best-effort by OS  
- Windows live capture may need Npcap and elevated privileges  
- Single-machine SQLite in v1  

## License

MIT

# Outbounds sniffer

Python worker that posts outbound connection metadata to the API.

## Modes

| Mode | Status |
|---|---|
| `dry-run` (default) | Synthetic events — no admin/pcap needed |
| `live` | Best-effort Scapy capture (Npcap on Windows) |

## Setup

```bash
cd services/sniffer
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

## Run (dry-run)

API on `:4000`, then:

```bash
python main.py
```

## Run (live)

1. Windows: install [Npcap](https://npcap.com/) and open an elevated terminal when required  
2. Set in `.env`:

```bash
MODE=live
# optional: CAPTURE_IFACE=eth0   (Linux) / adapter name (Windows)
```

3. Run:

```bash
python main.py
```

If capture cannot start, the process exits with a clear error — use `MODE=dry-run` for demos.

**Metadata only.** No TLS decryption / payload inspection.

## Env

| Var | Default | Notes |
|---|---|---|
| `OUTBOUNDS_API_URL` | `http://localhost:4000/api/events` | Ingest |
| `OUTBOUNDS_HEARTBEAT_URL` | `http://localhost:4000/api/heartbeat` | Liveness |
| `OUTBOUNDS_TOKEN` | `dev-local-token` | Must match API |
| `BATCH_MS` | `1000` | Flush interval |
| `MODE` | `dry-run` | `dry-run` \| `live` |
| `CAPTURE_IFACE` | empty | Optional interface name |

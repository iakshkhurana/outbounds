# Outbounds sniffer

Posts outbound connection metadata to the API.

## Modes

| Mode | What you see | Needs |
|---|---|---|
| **`connections` (default)** | Real remote peers from OS (Chrome, apps) | `psutil` only |
| `live` | Packet-level capture | Npcap + Scapy + often Admin |
| `dry-run` | Fake demo events | nothing |

**Important:** For real Chrome traffic, run the sniffer on your **Windows/macOS/Linux host**, not inside Docker. A container cannot see your desktop browser sockets.

## Realtime Chrome demo (recommended)

Terminal 1 — API (or Docker api only):

```bash
docker compose up --build api
# or: cd services/api && npm run dev
```

Terminal 2 — sniffer on host:

```bash
cd services/sniffer
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py
```

Terminal 3 — web:

```bash
docker compose up --build web
# or: cd web && npm run dev
```

Open http://localhost:3000, then open Chrome and visit sites. Dashboard should fill within a few seconds (UI polls every 3s). Do **not** click Replay sample if you want only real traffic.

## Dry-run / sample

Only if you need a demo without real traffic: UI **Replay sample**, or `MODE=dry-run`.

## Live packet mode

```bash
# .env
MODE=live
# CAPTURE_IFACE=...
python main.py
```

Windows: install [Npcap](https://npcap.com/), elevated shell if required.

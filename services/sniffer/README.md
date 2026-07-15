# Outbounds sniffer

Python worker that posts outbound connection metadata to the API.

## Modes

| Mode | Status |
|---|---|
| `dry-run` (default) | Emits synthetic events — no admin/pcap needed |
| `live` | Reserved for packet capture (Npcap/Scapy) — not wired yet |

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

## Run

Make sure the API is up on `:4000`, then:

```bash
python main.py
```

You should see flush logs. Check the web UI / `GET /api/overview` for new hosts.

## Windows live capture notes (later)

- Install [Npcap](https://npcap.com/)
- Run the capture process elevated when required
- Prefer a dedicated lab interface
- Outbounds still observes **metadata only** — no TLS decryption

## Env

See `.env.example` for `OUTBOUNDS_API_URL`, `OUTBOUNDS_TOKEN`, `BATCH_MS`, and `MODE`.

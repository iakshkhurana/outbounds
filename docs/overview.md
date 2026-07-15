# Outbounds — Overview

**One-liner:** See who your device is really talking to.

**Tagline (Serious):** Local network visibility for DNS failures, latency ghosts, and unexpected outbound connections.

**Tagline (Story):** Your apps can’t gaslight you anymore.

---

## What this is

Outbounds is a student-built **network observability tool** for your own machine/lab:

- Captures **connection metadata** (not full packet payloads / not HTTPS content)
- Surfaces **who**, **where**, **how often**, and **what looks off**
- Ships as a polished TS full-stack app + small Python sniffer worker

Built as a portfolio project aligned with Cisco-style themes: networking fundamentals, debugging, secure coding, testing, and clear product thinking.

---

## What this is NOT

- Not a Cisco product clone
- Not a MITM proxy / TLS decryptor
- Not a production enterprise firewall / IDS
- Not a VPN replacement

Honesty is a feature. Document limitations in the README and demo.

---

## Primary user

CS student / developer debugging:

- “Why is this site slow?”
- “Which app is calling home?”
- “Is DNS failing?”
- “What weird ports am I opening?”

---

## Core loop

1. Sniffer collects outbound events
2. API stores + scores them
3. Dashboard shows live overview + host details
4. User exports a short debug report

---

## Success for v1

- Fresh clone → `docker compose up` (or 2 scripts) → UI works
- Fallback sample dataset if capture needs admin/pcap
- 60s demo that tells a clear story
- Referral-safe pitch: fascinating, defensible, not overclaimed

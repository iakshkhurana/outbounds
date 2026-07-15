# Outbounds — Overview

**One-liner:** See who your device is really talking to.

**Tagline (Serious):** Local network visibility for DNS failures, latency issues, and unexpected outbound connections.

**Tagline (Story):** Your apps can’t gaslight you anymore.

---

## What this is

Outbounds is a **local network visibility product** for your own machine or lab:

- Captures **connection metadata** (not payloads, not HTTPS content)
- Surfaces **who**, **where**, **how often**, and **what looks off**
- Runs as three services: web UI, API, and Python sniffer

---

## What this is NOT

- Not a MITM proxy / TLS decryptor
- Not an enterprise firewall or IDS
- Not a VPN

Limits stay documented in the README.

---

## Primary user

Developer or student debugging connectivity:

- “Why is this site slow?”
- “Which app is calling home?”
- “Is DNS failing?”
- “What odd ports am I opening?”

---

## Core loop

1. Sniffer collects outbound events  
2. API stores and scores them  
3. Web shows overview + host detail  
4. User exports a short debug report  

---

## Success for v1

- Clean local run for web + api (+ optional sniffer)
- Replay fixtures when live capture isn’t available
- Explainable risk reasons
- Polish that reads like a finished product, not a lab dump

# Outbounds — PRD (v1)

## Problem

Developers know *something* is wrong with connectivity, but not **what**. Browser “site not loading”, random slowness, and silent background app traffic are hard to see without Wireshark-level pain.

## Goal

Ship a **beautiful, small, understandable** tool that answers:

> Right now, what is this device talking to — and what looks broken or weird?

## Non-goals (v1)

- Decrypt HTTPS bodies
- Cross-machine fleet monitoring
- Auto-blocking traffic (read-only observer first)
- Mobile app store release
- Kernel modules / eBPF deep dives

## Personas

| Persona | Need |
|---|---|
| Developer | Fast visibility without Wireshark |
| Student / lab user | Learn networking with a clear UI |
| Reviewer | Credible scope, clean engineering, honest limits |

## User stories

1. As a user, I can start capture (or load sample data) and see active outbound hosts in <10s.
2. As a user, I can spot failed DNS lookups quickly.
3. As a user, I can open a host and see ports, latency trend, last seen, and risk reasons.
4. As a user, I can filter by risk / protocol / search string.
5. As a user, I can export a Markdown debug report.
6. As a user, I can toggle Serious vs Story labels (Serious default).

## Functional requirements

### Must (P0)

- Ingest events from Python sniffer OR sample replay
- Persist events (SQLite)
- Dashboard overview metrics:
  - active hosts (window)
  - failed DNS count
  - high-latency count
- Live-ish event feed
- Host detail page
- Basic risk rules engine
- Export report
- Auth-lite optional: local single-user, no accounts required in v1

### Should (P1)

- Search + filters
- Tone toggle (Serious/Story)
- Capture status indicator + last heartbeat from sniffer
- Simple soak test notes in docs

### Nice (P2)

- Dark/light (dark default)
- Rule editor UI
- Blocklist suggestions (still no enforce in v1)

## UX principles

- One job per screen
- First viewport: brand **Outbounds** + 3 metrics + live feed — no clutter stack of cards
- No fake enterprise dashboard chrome
- Motion: subtle pulse on capturing, row enter, chart ease — max ~3 intentional motions
- Visual: charcoal + teal accent; mono for IPs/ports/logs; avoid purple-glow AI slop

## Metrics of quality (project)

- Demo boots reliably
- Code is typed + linted
- Risk rules unit tested
- README has screenshots + limitations
- You can explain every feature in plain English

## Release definition — v1 done

All P0 complete, README run path works, and a short end-to-end demo is recordable.

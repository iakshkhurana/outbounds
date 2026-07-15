# Outbounds — Decisions (ADRs lite)

## D1 — Name: Outbounds

**Decision:** Product name is **Outbounds**.  
**Why:** Clear product name; memorable without being a joke brand.  
**Consequence:** Repo, docs, and UI brand use Outbounds. Story-tone labels stay UI-only.

## D2 — Microservices: web + api + sniffer

**Decision:** Separate `web/`, `services/api`, and `services/sniffer`.  
**Why:** Clear service boundaries — UI, persistence/risk, and capture stay independent.  
**Consequence:** CORS + env URLs; three local processes.

## D2b — TypeScript API + Python sniffer

**Decision:** API in TypeScript; capture worker in Python.  
**Why:** TS strength on product/API; Python for packet libs + JD alignment.  
**Consequence:** JSON contract between services.

## D3 — Metadata only, no TLS decryption

**Decision:** Observe destinations/ports/DNS/latency — never MITM.  
**Why:** Ethics, legality, scope, trust.  
**Consequence:** Market as observability, not content inspection.

## D4 — SQLite + Prisma

**Decision:** Local SQLite for v1.  
**Why:** Zero ops, easy demo, enough for single machine.  
**Consequence:** Not multi-writer heavy; fine for local v1.

## D5 — Replay mode is first-class

**Decision:** Sample JSONL replay always works without pcap privileges.  
**Why:** Windows capture friction kills demos.  
**Consequence:** Build UI against sample data first.

## D6 — No blocking in v1

**Decision:** Read-only watcher.  
**Why:** Blocking = OS permissions + safety risk + scope explosion.  
**Consequence:** Can suggest “would block” in report later (P2).

## D7 — Serious default tone

**Decision:** UI defaults to Serious labels.  
**Why:** Professional default for demos and reviews.  
**Consequence:** Story mode is optional flair.

## D8 — Polling before SSE

**Decision:** v1 UI polls every 2–3s.  
**Why:** Simpler, good enough.  
**Consequence:** SSE future upgrade if polish needs it.

## D9 — Risk rules are code, not ML

**Decision:** Deterministic thresholds + unit tests.  
**Why:** Explainable in interviews; no fake AI.  
**Consequence:** Easy to demo “why flagged”.

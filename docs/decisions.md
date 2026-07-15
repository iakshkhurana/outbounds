# Outbounds — Decisions (ADRs lite)

## D1 — Name: Outbounds

**Decision:** Product name is **Outbounds**.  
**Why:** Clear, product-y, referral-safe; less meme than “Packet Snitch”, still memorable.  
**Consequence:** Repo, docs, UI brand use Outbounds. Snitch-style copy only in Story tone.

## D2 — TypeScript product + Python sniffer

**Decision:** UI/API in Next.js/TS; capture worker in Python.  
**Why:** Builder strength in TS; Python matches Cisco JD + easier packet libs.  
**Consequence:** Clear JSON contract; two runtimes in Compose.

## D3 — Metadata only, no TLS decryption

**Decision:** Observe destinations/ports/DNS/latency — never MITM.  
**Why:** Ethics, legality, scope, trust.  
**Consequence:** Market as observability, not content inspection.

## D4 — SQLite + Prisma

**Decision:** Local SQLite for v1.  
**Why:** Zero ops, easy demo, enough for single machine.  
**Consequence:** Not multi-writer heavy; fine for portfolio.

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
**Why:** Referral / Cisco employee viewing.  
**Consequence:** Story mode is optional flair.

## D8 — Polling before SSE

**Decision:** v1 UI polls every 2–3s.  
**Why:** Simpler, good enough.  
**Consequence:** SSE future upgrade if polish needs it.

## D9 — Risk rules are code, not ML

**Decision:** Deterministic thresholds + unit tests.  
**Why:** Explainable in interviews; no fake AI.  
**Consequence:** Easy to demo “why flagged”.

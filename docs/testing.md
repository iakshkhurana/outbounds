# Outbounds — Testing

## Philosophy

Test the things that make Outbounds *believable*:

1. Event validation
2. Risk rules
3. Aggregations / overview math
4. Critical UI empty states (smoke)

Skip pixel-perfect snapshot farming in v1.

## Web / API

### Unit

- `riskEngine` pure functions
- zod schemas accept/reject fixtures
- overview counters for a fixed event set

### Integration (light)

- POST `/api/events` with token → host created
- Bad token → 401
- Replay endpoint loads sample file (with env flag)

### Commands (target)

```bash
pnpm test
pnpm lint
pnpm typecheck
```

## Sniffer

- Parser unit tests with tiny synthetic packets / fixtures when possible
- “Dry run” mode that emits fake events without pcap
- Don’t require root in CI

## Fixtures to keep in repo

```text
sample-data/
  events.jsonl          # happy demo
  events-dns-fail.jsonl # failed DNS story
  events-latency.jsonl  # slow host story
```

## Manual test script (before recording demo)

1. `demo/reset` → empty state looks good
2. `demo/replay` → metrics populate
3. Open a `watch` host → reasons readable
4. Export report → opens/downloads Markdown
5. Toggle Story tone → labels change, layout stable
6. Stop sniffer → offline banner appears (if live)

## Scale / soak (reliability evidence)

- Replay 10k events; UI still usable
- Note p95 ingest time in README (even rough)
- No crash, no runaway memory for 10 minutes replay loop

## Interview talking points

- What you tested and why
- One bug caught by a unit test
- Limitation you chose not to paper over

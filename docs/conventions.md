# Outbounds — Conventions

Follow these so the project looks intentional, not random.

## Language & packages

- App code: **TypeScript strict**
- Sniffer: **Python 3.11+**, type hints where easy
- Prefer one way: pnpm/npm — pick one and stick
- No unnecessary deps. Charts yes. Animation library only if needed lightly.

## Naming

- Product: **Outbounds**
- Folders: `web/`, `services/api/`, `services/sniffer/`, `sample-data/`, `docs/`
- UI routes: `/`, `/hosts/[id]`, `/report`
- API default port `4000`; web `3000`
- Risk enums: `clean | watch | risky` (never store Story slang in DB)

## Code style

- Feature folders over giant `utils.ts`
- zod at every API boundary
- Web talks to API over HTTP; don’t hide business logic only in UI
- No `any` unless cornered — comment why
- Functions small; risk rules pure + unit tested (in API service)

## Git

- Conventional-ish commits: `feat:`, `fix:`, `docs:`, `chore:`
- Don’t commit `.env`, `*.db`, pcap dumps, secrets
- Keep PRs/commits small when possible

## UI conventions

CSS variables (example):

```css
:root {
  --bg: #0e1114;
  --panel: #161b21;
  --text: #e8eef4;
  --muted: #8b98a8;
  --accent: #2fd3c7;
  --warn: #f0b429;
  --danger: #ff6b6b;
  --border: #243040;
  --mono: ui-monospace, "JetBrains Mono", Menlo, monospace;
  --sans: "IBM Plex Sans", "Segoe UI", sans-serif;
}
```

Rules:

- Brand name visible as a hero-level signal on home
- First viewport: brand + 3 metrics + feed — no promo junk
- Cards only when they help interaction; prefer layout + separators
- Mono font for IP / port / protocol / logs
- Tone toggle does not redesign layout; only copy/chips

## Security conventions

- Never log full packets / secrets
- Token required for ingest
- Demo reset/replay endpoints disabled unless env flag
- README states metadata-only collection

## Comments

- Comment *why*, not *what*
- Keep PRD/docs as source of truth — don’t invent random features mid-build

## When stuck

1. Check `prd.md` scope  
2. Prefer Replay mode to unblock UI  
3. Write a failing test for risk rule  
4. Don’t add Kafka

# Outbounds API

TypeScript microservice for ingest, risk scoring, queries, demo replay, and reports.

## Setup

```bash
cd services/api
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
```

## Run

```bash
npm run dev
```

Listens on `http://localhost:4000` by default.

## Useful calls

```bash
# health
curl http://localhost:4000/health

# load sample events (requires ALLOW_DEMO_REPLAY=true)
curl -X POST http://localhost:4000/api/demo/replay ^
  -H "content-type: application/json" ^
  -d "{}"

# overview
curl "http://localhost:4000/api/overview?windowSec=300"

# report (markdown)
curl "http://localhost:4000/api/report?format=markdown"
```

Ingest from sniffer:

```bash
curl -X POST http://localhost:4000/api/events \
  -H "content-type: application/json" \
  -H "x-outbounds-token: dev-local-token" \
  -d "{\"batchId\":\"t1\",\"events\":[{\"ts\":\"2026-07-15T04:20:01.000Z\",\"ip\":\"1.1.1.1\",\"hostname\":\"one.one.one.one\",\"protocol\":\"dns\",\"dstPort\":53,\"domain\":\"example.com\",\"dnsStatus\":\"ok\",\"latencyMs\":18}]}"
```

## Tests

```bash
npm test
```

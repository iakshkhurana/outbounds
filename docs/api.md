# Outbounds — API

Base: `http://localhost:3000`

Auth for ingest: header `x-outbounds-token: <SNIFFER_SHARED_TOKEN>`

All JSON. Validate with **zod**.

---

## Ingest

### `POST /api/events`

Ingest a batch from sniffer or replay tool.

**Headers**

- `content-type: application/json`
- `x-outbounds-token: ...`

**Body**

```json
{
  "batchId": "string",
  "sessionId": "string?",
  "events": [EventInput]
}
```

**Responses**

- `202` accepted `{ "accepted": number, "hostsTouched": number }`
- `400` validation error
- `401` bad/missing token
- `413` batch too large (max 500 events)

---

## Capture health

### `POST /api/heartbeat`

Sniffer liveness.

```json
{ "sessionId": "string", "mode": "live", "source": "\\Device\\NPF_..." }
```

### `GET /api/capture/status`

```json
{
  "mode": "live|replay|idle",
  "online": true,
  "lastHeartbeatAt": "ISO",
  "sessionId": "..."
}
```

---

## Reads (UI)

### `GET /api/overview?windowSec=300`

```json
{
  "activeHosts": 12,
  "failedDns": 3,
  "highLatency": 2,
  "eventsInWindow": 480,
  "topHosts": [{ "id": "...", "label": "api.github.com", "eventCount": 40, "riskLevel": "clean" }]
}
```

### `GET /api/hosts?q=&risk=&limit=50&cursor=`

List hosts, newest activity first.

### `GET /api/hosts/:id`

Host detail + recent events + risk reasons.

### `GET /api/events?hostId=&limit=100`

Raw-ish event feed for UI table.

### `GET /api/report?windowSec=300&format=markdown`

Returns Markdown report (or JSON if `format=json`).

---

## Control (demo helpers)

### `POST /api/demo/replay`

Loads `sample-data/events.jsonl` into DB (dev/demo only). Guard with env `ALLOW_DEMO_REPLAY=true`.

### `POST /api/demo/reset`

Clears events/hosts for clean recording. Dev only.

---

## Error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "dstPort must be int",
    "details": {}
  }
}
```

## Pagination

Use cursor on `lastSeenAt+id` or `ts+id`. Keep simple.

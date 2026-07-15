#!/usr/bin/env bash
set -euo pipefail

API_BASE="${1:-http://127.0.0.1:4000}"

echo "1) health"
curl -fsS "$API_BASE/health" | grep -q '"ok":true'
echo "   ok"

echo "2) demo reset"
curl -fsS -X POST "$API_BASE/api/demo/reset" \
  -H "content-type: application/json" \
  -d '{}' >/dev/null
echo "   ok"

echo "3) demo replay"
REPLAY=$(curl -fsS -X POST "$API_BASE/api/demo/replay" \
  -H "content-type: application/json" \
  -d '{}')
echo "   $REPLAY"

echo "4) overview"
OVERVIEW=$(curl -fsS "$API_BASE/api/overview?windowSec=300")
echo "   $OVERVIEW"
echo "$OVERVIEW" | grep -Eq '"activeHosts":[1-9]'

echo "5) report json"
curl -fsS "$API_BASE/api/report?format=json&windowSec=300" >/dev/null
echo "   ok"

echo
echo "Smoke passed."

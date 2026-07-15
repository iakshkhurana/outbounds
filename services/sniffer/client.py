from __future__ import annotations

import uuid
from typing import Any

import requests

from config import API_EVENTS_URL, API_HEARTBEAT_URL, TOKEN


class ApiClient:
    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self._http = requests.Session()
        self._http.headers.update(
            {
                "content-type": "application/json",
                "x-outbounds-token": TOKEN,
            }
        )

    def post_events(self, events: list[dict[str, Any]]) -> dict[str, Any]:
        payload = {
            "batchId": str(uuid.uuid4()),
            "sessionId": self.session_id,
            "events": events,
        }
        response = self._http.post(API_EVENTS_URL, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()

    def heartbeat(self, mode: str, source: str) -> dict[str, Any]:
        payload = {
            "sessionId": self.session_id,
            "mode": mode,
            "source": source,
        }
        response = self._http.post(API_HEARTBEAT_URL, json=payload, timeout=5)
        response.raise_for_status()
        return response.json()

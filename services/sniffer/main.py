from __future__ import annotations

import queue
import signal
import sys
import threading
import time
import uuid
from typing import Any

from client import ApiClient
from config import BATCH_MS, CAPTURE_IFACE, MODE
from dry_run import generate_dry_run_events


def _flush(client: ApiClient, batch: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not batch:
        return batch
    try:
        result = client.post_events(batch)
        print(
            f"flushed {len(batch)} events "
            f"(accepted={result.get('accepted')}, hosts={result.get('hostsTouched')})"
        )
    except Exception as exc:  # noqa: BLE001
        print(f"ingest failed: {exc}")
    return []


def run_dry_run(client: ApiClient, stop_flag: dict[str, bool]) -> None:
    events_iter = generate_dry_run_events()
    batch: list[dict[str, Any]] = []
    last_flush = time.time()
    last_heartbeat = 0.0

    while not stop_flag["stop"]:
        batch.append(next(events_iter))
        now = time.time()

        if now - last_heartbeat >= 5:
            try:
                client.heartbeat(mode="live", source="dry-run")
                last_heartbeat = now
            except Exception as exc:  # noqa: BLE001
                print(f"heartbeat failed: {exc}")

        if (now - last_flush) * 1000 >= BATCH_MS:
            batch = _flush(client, batch)
            last_flush = now

        time.sleep(0.35)

    _flush(client, batch)


def run_live(client: ApiClient, stop_flag: dict[str, bool]) -> None:
    from live import run_live_loop

    q: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=2000)
    source = CAPTURE_IFACE or "default-iface"

    def should_stop() -> bool:
        return stop_flag["stop"]

    worker = threading.Thread(
        target=run_live_loop,
        args=(q, CAPTURE_IFACE or None, should_stop),
        daemon=True,
        name="scapy-sniff",
    )
    worker.start()
    print(f"live capture thread started (iface={source})")

    batch: list[dict[str, Any]] = []
    last_flush = time.time()
    last_heartbeat = 0.0

    while not stop_flag["stop"]:
        try:
            while True:
                batch.append(q.get_nowait())
        except queue.Empty:
            pass

        now = time.time()
        if now - last_heartbeat >= 5:
            try:
                client.heartbeat(mode="live", source=f"live:{source}")
                last_heartbeat = now
            except Exception as exc:  # noqa: BLE001
                print(f"heartbeat failed: {exc}")

        if (now - last_flush) * 1000 >= BATCH_MS:
            batch = _flush(client, batch)
            last_flush = now

        time.sleep(0.2)

    _flush(client, batch)


def main() -> int:
    session_id = str(uuid.uuid4())
    client = ApiClient(session_id=session_id)
    stop_flag = {"stop": False}

    def handle_signal(_signum: int, _frame: object) -> None:
        stop_flag["stop"] = True

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    if MODE not in {"dry-run", "live"}:
        print(f"Unknown MODE={MODE!r}. Use dry-run or live.")
        return 1

    print(f"Outbounds sniffer starting in {MODE} mode (session={session_id})")

    try:
        if MODE == "live":
            run_live(client, stop_flag)
        else:
            run_dry_run(client, stop_flag)
    except RuntimeError as exc:
        print(str(exc))
        print("Tip: set MODE=dry-run for permission-free demos.")
        return 1

    print("sniffer stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())

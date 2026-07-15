from __future__ import annotations

import signal
import sys
import time
import uuid

from client import ApiClient
from config import BATCH_MS, MODE
from dry_run import generate_dry_run_events


def main() -> int:
    session_id = str(uuid.uuid4())
    client = ApiClient(session_id=session_id)
    stop = False

    def handle_signal(_signum: int, _frame: object) -> None:
        nonlocal stop
        stop = True

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    if MODE not in {"dry-run", "live"}:
        print(f"Unknown MODE={MODE!r}. Use dry-run or live.")
        return 1

    if MODE == "live":
        print(
            "Live capture is not enabled in this build yet. "
            "Set MODE=dry-run (default) or wait for the scapy path."
        )
        return 1

    print(f"Outbounds sniffer starting in {MODE} mode (session={session_id})")
    events_iter = generate_dry_run_events()
    batch: list[dict] = []
    last_flush = time.time()
    last_heartbeat = 0.0

    while not stop:
        batch.append(next(events_iter))
        now = time.time()

        if now - last_heartbeat >= 5:
            try:
                client.heartbeat(mode="live", source="dry-run")
                last_heartbeat = now
            except Exception as exc:  # noqa: BLE001 - keep loop alive
                print(f"heartbeat failed: {exc}")

        if (now - last_flush) * 1000 >= BATCH_MS and batch:
            try:
                result = client.post_events(batch)
                print(
                    f"flushed {len(batch)} events "
                    f"(accepted={result.get('accepted')}, hosts={result.get('hostsTouched')})"
                )
            except Exception as exc:  # noqa: BLE001
                print(f"ingest failed: {exc}")
            batch = []
            last_flush = now

        time.sleep(0.35)

    if batch:
        try:
            client.post_events(batch)
        except Exception as exc:  # noqa: BLE001
            print(f"final flush failed: {exc}")

    print("sniffer stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())

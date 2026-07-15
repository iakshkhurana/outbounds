from __future__ import annotations

import socket
from datetime import datetime, timezone
from typing import Any, Iterator

import psutil


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _is_remote(ip: str | None) -> bool:
    if not ip:
        return False
    if ip in {"127.0.0.1", "::1", "0.0.0.0", "::"}:
        return False
    if ip.startswith("127."):
        return False
    return True


def snapshot_outbound_events() -> list[dict[str, Any]]:
    """
    Read current OS network connections (no Npcap).
    Emits one event per remote TCP/UDP peer — good enough to watch Chrome traffic.
    """
    events: list[dict[str, Any]] = []
    seen: set[tuple[str, int, str]] = set()

    try:
        conns = psutil.net_connections(kind="inet")
    except (psutil.AccessDenied, PermissionError):
        # On Windows, non-elevated may still see own-user sockets; retry without pid
        conns = psutil.net_connections(kind="inet")

    for conn in conns:
        if not conn.raddr:
            continue
        remote_ip = conn.raddr.ip
        remote_port = int(conn.raddr.port)
        if not _is_remote(remote_ip):
            continue
        # Prefer active sockets
        status = (conn.status or "").upper()
        if status and status not in {
            "ESTABLISHED",
            "SYN_SENT",
            "SYN_RECV",
            "NONE",  # UDP often NONE
        }:
            if status not in {"ESTABLISHED", "SYN_SENT"}:
                continue

        proto = "tcp" if conn.type == socket.SOCK_STREAM else "udp"
        key = (remote_ip, remote_port, proto)
        if key in seen:
            continue
        seen.add(key)

        hostname = None
        # Skip reverse DNS in the hot path (can block / hang on Windows).
        # Hostname stays null; UI shows IP and optional process name.

        process_name = None
        if conn.pid:
            try:
                process_name = psutil.Process(conn.pid).name()
            except (psutil.Error, ProcessLookupError):
                process_name = None

        events.append(
            {
                "ts": _utcnow(),
                "ip": remote_ip,
                "hostname": hostname,
                "protocol": proto,
                "direction": "out",
                "srcPort": int(conn.laddr.port) if conn.laddr else None,
                "dstPort": remote_port,
                "domain": None,
                "dnsStatus": "unknown",
                "latencyMs": None,
                "bytesOut": 0,
                "bytesIn": 0,
                "processName": process_name,
            }
        )

    return events


def poll_connection_events(interval_sec: float = 1.0) -> Iterator[list[dict[str, Any]]]:
    """Yield batches of newly seen or still-active remote endpoints."""
    previous: set[tuple[str, int, str]] = set()
    while True:
        batch = snapshot_outbound_events()
        current = {
            (e["ip"], int(e["dstPort"] or 0), e["protocol"]) for e in batch
        }
        # Emit new connections immediately; also re-emit a few established ones so UI stays alive
        fresh = [
            e
            for e in batch
            if (e["ip"], int(e["dstPort"] or 0), e["protocol"]) not in previous
        ]
        previous = current
        if fresh:
            yield fresh
        elif batch:
            # Keep heartbeat of activity: sample up to 5 current connections
            yield batch[:5]
        else:
            yield []
        import time

        time.sleep(interval_sec)

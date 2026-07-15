from __future__ import annotations

import queue
import socket
from datetime import datetime, timezone
from typing import Any, Callable


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def packet_to_event(pkt: Any) -> dict[str, Any] | None:
    """Extract outbound-ish metadata from a Scapy packet. Metadata only."""
    try:
        from scapy.layers.inet import IP, TCP, UDP  # type: ignore
        from scapy.layers.dns import DNS  # type: ignore
    except Exception:
        return None

    if IP not in pkt:
        return None

    ip_layer = pkt[IP]
    dst_ip = ip_layer.dst
    protocol = "other"
    dst_port = None
    src_port = None
    domain = None
    dns_status = "unknown"

    if UDP in pkt:
        protocol = "udp"
        src_port = int(pkt[UDP].sport)
        dst_port = int(pkt[UDP].dport)
        if DNS in pkt and pkt[DNS].qr == 0 and pkt[DNS].qd is not None:
            protocol = "dns"
            try:
                domain = pkt[DNS].qd.qname.decode(errors="ignore").rstrip(".")
            except Exception:
                domain = None
        elif DNS in pkt and pkt[DNS].qr == 1:
            protocol = "dns"
            if pkt[DNS].rcode == 0:
                dns_status = "ok"
            else:
                dns_status = "failed"
            try:
                if pkt[DNS].qd is not None:
                    domain = pkt[DNS].qd.qname.decode(errors="ignore").rstrip(".")
            except Exception:
                domain = None
    elif TCP in pkt:
        protocol = "tcp"
        src_port = int(pkt[TCP].sport)
        dst_port = int(pkt[TCP].dport)

    if dst_ip.startswith("127.") or dst_ip == "::1":
        return None

    hostname = None
    try:
        hostname = socket.gethostbyaddr(dst_ip)[0]
    except Exception:
        hostname = None

    length = int(getattr(pkt, "len", 0) or 0)

    return {
        "ts": _utcnow(),
        "ip": dst_ip,
        "hostname": hostname,
        "protocol": protocol if protocol in {"tcp", "udp", "dns", "other"} else "other",
        "direction": "out",
        "srcPort": src_port,
        "dstPort": dst_port,
        "domain": domain,
        "dnsStatus": dns_status,
        "latencyMs": None,
        "bytesOut": length,
        "bytesIn": 0,
        "processName": None,
    }


def run_live_loop(
    out_queue: queue.Queue[dict[str, Any]],
    iface: str | None,
    should_stop: Callable[[], bool],
) -> None:
    """Blocking sniff loop suitable for a daemon thread."""
    try:
        from scapy.all import sniff  # type: ignore
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            "Scapy is not installed. pip install scapy and install Npcap on Windows."
        ) from exc

    def _handler(pkt: Any) -> None:
        event = packet_to_event(pkt)
        if event is None:
            return
        try:
            out_queue.put_nowait(event)
        except queue.Full:
            pass

    while not should_stop():
        sniff(
            prn=_handler,
            store=False,
            filter="ip",
            iface=iface or None,
            timeout=1,
            quiet=True,
        )

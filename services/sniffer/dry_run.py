from __future__ import annotations

import itertools
import random
from datetime import datetime, timezone
from typing import Any, Iterator


_DESTINATIONS = [
    ("140.82.112.4", "api.github.com", "tcp", 443, None, "unknown"),
    ("1.1.1.1", "one.one.one.one", "dns", 53, "example.com", "ok"),
    ("8.8.8.8", "dns.google", "dns", 53, "missing.lab.outbounds.test", "failed"),
    ("203.0.113.50", "odd.port.lab", "tcp", 5555, None, "unknown"),
    ("198.51.100.10", "slow.edge.lab", "tcp", 443, None, "unknown"),
    ("104.16.132.229", "cloudflare.com", "tcp", 443, None, "unknown"),
]


def generate_dry_run_events() -> Iterator[dict[str, Any]]:
    cycle = itertools.cycle(_DESTINATIONS)
    while True:
        ip, hostname, protocol, dst_port, domain, dns_status = next(cycle)
        latency = (
            random.randint(280, 700)
            if "slow" in hostname
            else random.randint(15, 90)
        )
        yield {
            "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "ip": ip,
            "hostname": hostname,
            "protocol": protocol,
            "direction": "out",
            "dstPort": dst_port,
            "domain": domain,
            "dnsStatus": dns_status,
            "latencyMs": latency,
            "bytesOut": random.randint(40, 1800),
            "bytesIn": random.randint(0, 9000),
            "processName": "dry-run",
        }

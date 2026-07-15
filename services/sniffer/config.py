import os
from dotenv import load_dotenv

load_dotenv()


def env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None or value == "":
        raise RuntimeError(f"Missing required env var: {name}")
    return value


API_EVENTS_URL = env("OUTBOUNDS_API_URL", "http://localhost:4000/api/events")
API_HEARTBEAT_URL = env(
    "OUTBOUNDS_HEARTBEAT_URL",
    "http://localhost:4000/api/heartbeat",
)
TOKEN = env("OUTBOUNDS_TOKEN", "dev-local-token")
BATCH_MS = int(env("BATCH_MS", "1000"))
MODE = env("MODE", "dry-run").lower()

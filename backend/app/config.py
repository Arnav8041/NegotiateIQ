import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Required ──
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
if not GOOGLE_API_KEY:
    logger.critical("GOOGLE_API_KEY environment variable is required")
    sys.exit(1)

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")

# ── Authentication ──
NEGOTIATEIQ_API_KEY = os.getenv("NEGOTIATEIQ_API_KEY", "")

# ── Environment ──
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")  # "development" | "production"

# ── CORS ──
_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _origins_raw.split(",") if o.strip()]

# ── WebSocket limits ──
MAX_WS_CONNECTIONS = int(os.getenv("MAX_WS_CONNECTIONS", "10"))

# ── Gemini API ──
GEMINI_TIMEOUT_SECONDS = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "30"))

PORT = int(os.getenv("PORT", "8000"))

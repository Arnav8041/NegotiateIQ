import logging
import secrets

from fastapi import Header, HTTPException, WebSocket

from app.config import NEGOTIATEIQ_API_KEY

logger = logging.getLogger(__name__)


def _key_is_valid(provided: str) -> bool:
    """Constant-time comparison to prevent timing attacks."""
    if not NEGOTIATEIQ_API_KEY:
        # Auth disabled when no key configured (local dev)
        return True
    return secrets.compare_digest(provided, NEGOTIATEIQ_API_KEY)


async def verify_api_key(x_api_key: str = Header(default="")) -> None:
    """FastAPI dependency for HTTP endpoints."""
    if not _key_is_valid(x_api_key):
        logger.warning("Rejected request with invalid API key")
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


async def verify_ws_api_key(websocket: WebSocket) -> bool:
    """Verify API key for WebSocket connections via query parameter.

    Returns True if valid, False if rejected (after accepting + closing).
    Must be called BEFORE websocket.accept() in the handler — if auth fails,
    this function accepts then immediately closes with 4001.
    """
    api_key = websocket.query_params.get("api_key", "")
    if not _key_is_valid(api_key):
        logger.warning("Rejected WebSocket connection with invalid API key")
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid or missing API key")
        return False
    return True
